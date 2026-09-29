-- tie avatar uploads to the uploader and restrict file types
--
-- what:
--   - replaces the avatars INSERT policy on storage.objects. the file name
--     (before the first dot) must equal the caller's uid, and the extension
--     must be jpg, jpeg or png. (DB_AUDIT 6.6)
--   - sets allowed_mime_types on the avatars bucket to image/jpeg and image/png
--
-- why: the old policy checked only owner, which storage always sets to the
-- uploader, so user A could upload <userB-id>.png and block B from ever
-- setting that avatar (DB_AUDIT 4.7). the app already names files
-- `${userId}.${ext}` (lib/supabase/storage.ts:14), so uploads keep working.
--
-- the bucket stays PUBLIC. the SELECT, UPDATE and DELETE policies are unchanged.
--
-- idempotent: drop policy if exists, then create; the bucket update can be
-- repeated.

begin;

drop policy if exists "Users can upload their own avatar" on storage.objects;
create policy "Users can upload their own avatar"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and split_part(name, '.', 1) = (select auth.uid())::text
    and storage.extension(name) in ('jpg', 'jpeg', 'png')
  );

update storage.buckets
  set allowed_mime_types = array['image/jpeg', 'image/png']
  where id = 'avatars';

commit;

-- rollback (restores the original policy and removes the mime restriction)
-- begin;
-- drop policy if exists "Users can upload their own avatar" on storage.objects;
-- create policy "Users can upload their own avatar"
--   on storage.objects for insert to authenticated
--   with check (
--     bucket_id = 'avatars'
--     and (auth.uid())::text = (owner)::text
--     and (storage.extension(name) = 'jpg'
--          or storage.extension(name) = 'jpeg'
--          or storage.extension(name) = 'png')
--   );
-- update storage.buckets set allowed_mime_types = null where id = 'avatars';
-- commit;
