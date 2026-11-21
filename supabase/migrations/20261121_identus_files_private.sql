-- Make identus-files private. Run ONLY after the signed-links release is live and tested.
-- Signed-in users keep reading through the existing authenticated SELECT policy (signed links).
update storage.buckets set public = false where id = 'identus-files';

-- ROLLBACK (if any photo stops showing):
-- update storage.buckets set public = true where id = 'identus-files';
