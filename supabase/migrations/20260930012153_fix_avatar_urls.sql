-- replace expired signed avatar URLs with public URLs
--
-- what:
--   1. for each profile whose avatar_url is a signed URL
--      (.../storage/v1/object/sign/avatars/<path>?token=...) and whose file
--      still exists in the avatars bucket, rewrites it to
--      <same origin>/storage/v1/object/public/avatars/<path>?v=<ms timestamp>
--      where the timestamp is the object's updated_at (created_at if null)
--   2. sets avatar_url to null for any signed URL whose file no longer exists
--
-- why: the app used to save 24 hour signed URLs into profiles.avatar_url, so
-- every stored avatar breaks a day after upload (DB_AUDIT 4.7). the avatars
-- bucket is public, and the app now saves the public URL with a ?v=
-- cache-buster (lib/supabase/storage.ts). this brings existing rows in line.
--
-- the origin is taken from the stored URL, so no project URL is hardcoded.
-- rows that are null or already public are not touched.
--
-- data when written (2026-09-29): 5 profiles. 2 have signed URLs to
-- <user_id>.jpg files that exist and are owned by that user, 3 are null. so
-- step 1 updates 2 rows and step 2 updates none.
--
-- idempotent: both steps only match signed URLs, and after step 1 none are
-- left, so running it again changes nothing.

begin;

-- 1. signed URL with an existing file: rewrite to the public URL
update public.profiles p
set avatar_url =
  split_part(p.avatar_url, '/storage/v1/object/sign/', 1)
  || '/storage/v1/object/public/avatars/'
  || o.name
  || '?v='
  || (extract(epoch from coalesce(o.updated_at, o.created_at)) * 1000)::bigint
from storage.objects o
where p.avatar_url like '%/storage/v1/object/sign/avatars/%'
  and o.bucket_id = 'avatars'
  and o.name = split_part(
    split_part(p.avatar_url, '/storage/v1/object/sign/avatars/', 2),
    '?', 1
  );

-- 2. signed URL whose file is gone: clear it so the app shows the default avatar
update public.profiles
set avatar_url = null
where avatar_url like '%/storage/v1/object/sign/avatars/%';

commit;

-- rollback: not possible. the signed URLs held tokens that expired 24 hours
-- after they were created, so the old values would not work even if restored.
