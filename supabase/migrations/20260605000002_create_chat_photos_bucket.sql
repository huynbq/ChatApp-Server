insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'chat-photos',
  'chat-photos',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "chat photos public read" on storage.objects;
create policy "chat photos public read"
on storage.objects for select
using (bucket_id = 'chat-photos');

drop policy if exists "chat photos authenticated upload" on storage.objects;
create policy "chat photos authenticated upload"
on storage.objects for insert
to authenticated
with check (bucket_id = 'chat-photos');
