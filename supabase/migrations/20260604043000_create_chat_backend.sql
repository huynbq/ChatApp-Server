drop table if exists public.messages cascade;

do $$ begin
  create type public.chat_type as enum ('DIRECT', 'GROUP');
exception
  when duplicate_object then null;
end $$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  username text unique,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_length check (username is null or char_length(trim(username)) between 3 and 40)
);

create table public.chats (
  id uuid primary key default gen_random_uuid(),
  type public.chat_type not null default 'DIRECT',
  name text,
  created_by uuid not null references public.profiles(id) on delete cascade,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint group_chats_need_name check (type = 'DIRECT' or nullif(trim(name), '') is not null)
);

create table public.chat_members (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  unique (chat_id, user_id)
);

create index chat_members_user_id_idx on public.chat_members(user_id);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  reply_to_message_id uuid references public.messages(id),
  content text,
  deleted_at timestamptz,
  edited_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint message_content_or_deleted check (deleted_at is not null or content is not null)
);

create index messages_chat_id_created_at_idx on public.messages(chat_id, created_at);
create index messages_sender_id_idx on public.messages(sender_id);

create table public.message_attachments (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  bucket text not null,
  path text not null,
  mime_type text not null,
  size_bytes integer not null,
  created_at timestamptz not null default now()
);

create table public.message_mentions (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  mentioned_user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (message_id, mentioned_user_id)
);

create index message_mentions_mentioned_user_id_idx on public.message_mentions(mentioned_user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger chats_set_updated_at before update on public.chats for each row execute function public.set_updated_at();
create trigger messages_set_updated_at before update on public.messages for each row execute function public.set_updated_at();

create or replace function public.is_chat_member(target_chat_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.chat_members cm
    join public.chats c on c.id = cm.chat_id
    where cm.chat_id = target_chat_id
      and cm.user_id = auth.uid()
      and cm.deleted_at is null
      and c.deleted_at is null
  );
$$;

revoke all on function public.is_chat_member(uuid) from public;
grant execute on function public.is_chat_member(uuid) to authenticated;

alter table public.profiles enable row level security;
alter table public.chats enable row level security;
alter table public.chat_members enable row level security;
alter table public.messages enable row level security;
alter table public.message_attachments enable row level security;
alter table public.message_mentions enable row level security;

create policy "profiles are visible to authenticated users" on public.profiles for select to authenticated using (true);
create policy "users can insert their profile" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy "users can update their profile" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "members can see their chats" on public.chats for select to authenticated using (
  public.is_chat_member(id)
);

create policy "authenticated users can create chats" on public.chats for insert to authenticated with check ((select auth.uid()) = created_by);

create policy "members can update chats" on public.chats for update to authenticated using (
  public.is_chat_member(id)
);

create policy "members can see chat members" on public.chat_members for select to authenticated using (
  public.is_chat_member(chat_id)
);

create policy "members can add chat members" on public.chat_members for insert to authenticated with check (
  public.is_chat_member(chat_id) or user_id = (select auth.uid())
);

create policy "members can update chat members" on public.chat_members for update to authenticated using (
  public.is_chat_member(chat_id)
);

create policy "members can see messages" on public.messages for select to authenticated using (
  public.is_chat_member(messages.chat_id)
);

create policy "members can insert messages" on public.messages for insert to authenticated with check (
  sender_id = (select auth.uid()) and public.is_chat_member(messages.chat_id)
);

create policy "senders can update messages" on public.messages for update to authenticated using (sender_id = (select auth.uid())) with check (sender_id = (select auth.uid()));

create policy "members can see attachments" on public.message_attachments for select to authenticated using (
  exists (
    select 1 from public.messages m
    where m.id = message_id and public.is_chat_member(m.chat_id)
  )
);

create policy "members can insert attachments" on public.message_attachments for insert to authenticated with check (
  exists (
    select 1 from public.messages m
    where m.id = message_id and public.is_chat_member(m.chat_id)
  )
);

create policy "members can see mentions" on public.message_mentions for select to authenticated using (
  mentioned_user_id = (select auth.uid()) or exists (
    select 1 from public.messages m
    where m.id = message_id and public.is_chat_member(m.chat_id)
  )
);

create policy "members can insert mentions" on public.message_mentions for insert to authenticated with check (
  exists (
    select 1 from public.messages m
    where m.id = message_id and public.is_chat_member(m.chat_id)
  )
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('chat-photos', 'chat-photos', false, 10485760, array['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "chat photo members can read" on storage.objects for select to authenticated using (
  bucket_id = 'chat-photos'
  and public.is_chat_member(((storage.foldername(name))[1])::uuid)
);

create policy "chat photo members can upload" on storage.objects for insert to authenticated with check (
  bucket_id = 'chat-photos'
  and public.is_chat_member(((storage.foldername(name))[1])::uuid)
);

create policy "chat photo members can update" on storage.objects for update to authenticated using (
  bucket_id = 'chat-photos'
  and public.is_chat_member(((storage.foldername(name))[1])::uuid)
);
