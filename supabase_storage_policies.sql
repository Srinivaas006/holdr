insert into storage.buckets (id, name, public)
values ('user-files', 'user-files', true)
on conflict (id) do nothing;

create policy "Users can upload to their own folder"
on storage.objects for insert
to authenticated, anon
with check (bucket_id = 'user-files');

create policy "Users can read their own files"
on storage.objects for select
to authenticated, anon
using (bucket_id = 'user-files');

create policy "Users can delete their own files"
on storage.objects for delete
to authenticated, anon
using (bucket_id = 'user-files');
