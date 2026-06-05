create index if not exists chat_members_active_user_chat_idx
on public.chat_members (user_id, chat_id)
where deleted_at is null;

create index if not exists chat_members_active_chat_user_idx
on public.chat_members (chat_id, user_id)
where deleted_at is null;

create index if not exists chats_active_updated_at_idx
on public.chats (updated_at desc)
where deleted_at is null;
