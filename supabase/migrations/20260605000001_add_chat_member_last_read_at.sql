alter table public.chat_members
add column if not exists last_read_at timestamptz;

update public.chat_members
set last_read_at = now()
where last_read_at is null;

create index if not exists chat_members_active_user_last_read_idx
on public.chat_members (user_id, last_read_at)
where deleted_at is null;
