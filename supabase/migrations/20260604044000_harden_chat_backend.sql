create schema if not exists app_private;

revoke all on schema app_private from public;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function app_private.is_chat_member(target_chat_id uuid)
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

revoke all on function app_private.is_chat_member(uuid) from public;
grant usage on schema app_private to authenticated;
grant execute on function app_private.is_chat_member(uuid) to authenticated;

drop policy if exists "members can see their chats" on public.chats;
drop policy if exists "members can update chats" on public.chats;
drop policy if exists "members can see chat members" on public.chat_members;
drop policy if exists "members can add chat members" on public.chat_members;
drop policy if exists "members can update chat members" on public.chat_members;
drop policy if exists "members can see messages" on public.messages;
drop policy if exists "members can insert messages" on public.messages;
drop policy if exists "members can see attachments" on public.message_attachments;
drop policy if exists "members can insert attachments" on public.message_attachments;
drop policy if exists "members can see mentions" on public.message_mentions;
drop policy if exists "members can insert mentions" on public.message_mentions;
drop policy if exists "chat photo members can read" on storage.objects;
drop policy if exists "chat photo members can upload" on storage.objects;
drop policy if exists "chat photo members can update" on storage.objects;

create policy "members can see their chats" on public.chats for select to authenticated using (
  app_private.is_chat_member(id)
);

create policy "members can update chats" on public.chats for update to authenticated using (
  app_private.is_chat_member(id)
);

create policy "members can see chat members" on public.chat_members for select to authenticated using (
  app_private.is_chat_member(chat_id)
);

create policy "members can add chat members" on public.chat_members for insert to authenticated with check (
  app_private.is_chat_member(chat_id) or user_id = (select auth.uid())
);

create policy "members can update chat members" on public.chat_members for update to authenticated using (
  app_private.is_chat_member(chat_id)
);

create policy "members can see messages" on public.messages for select to authenticated using (
  app_private.is_chat_member(messages.chat_id)
);

create policy "members can insert messages" on public.messages for insert to authenticated with check (
  sender_id = (select auth.uid()) and app_private.is_chat_member(messages.chat_id)
);

create policy "members can see attachments" on public.message_attachments for select to authenticated using (
  exists (
    select 1 from public.messages m
    where m.id = message_id and app_private.is_chat_member(m.chat_id)
  )
);

create policy "members can insert attachments" on public.message_attachments for insert to authenticated with check (
  exists (
    select 1 from public.messages m
    where m.id = message_id and app_private.is_chat_member(m.chat_id)
  )
);

create policy "members can see mentions" on public.message_mentions for select to authenticated using (
  mentioned_user_id = (select auth.uid()) or exists (
    select 1 from public.messages m
    where m.id = message_id and app_private.is_chat_member(m.chat_id)
  )
);

create policy "members can insert mentions" on public.message_mentions for insert to authenticated with check (
  exists (
    select 1 from public.messages m
    where m.id = message_id and app_private.is_chat_member(m.chat_id)
  )
);

create policy "chat photo members can read" on storage.objects for select to authenticated using (
  bucket_id = 'chat-photos'
  and app_private.is_chat_member(((storage.foldername(name))[1])::uuid)
);

create policy "chat photo members can upload" on storage.objects for insert to authenticated with check (
  bucket_id = 'chat-photos'
  and app_private.is_chat_member(((storage.foldername(name))[1])::uuid)
);

create policy "chat photo members can update" on storage.objects for update to authenticated using (
  bucket_id = 'chat-photos'
  and app_private.is_chat_member(((storage.foldername(name))[1])::uuid)
);

drop function if exists public.is_chat_member(uuid);

create index if not exists chats_created_by_idx on public.chats(created_by);
create index if not exists message_attachments_message_id_idx on public.message_attachments(message_id);
create index if not exists messages_reply_to_message_id_idx on public.messages(reply_to_message_id);
