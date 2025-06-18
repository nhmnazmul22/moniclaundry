-- SOLUSI SEMENTARA: MATIKAN RLS DI TABEL STAFF
-- Agar fungsi add/edit/delete staff bisa berfungsi tanpa masalah RLS

ALTER TABLE public.staff DISABLE ROW LEVEL SECURITY;

-- Hapus semua kebijakan RLS yang bermasalah
DO $$
DECLARE
    policy_name TEXT;
BEGIN
    FOR policy_name IN (SELECT policyname FROM pg_policies WHERE tablename = 'staff' AND schemaname = 'public')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_name || '" ON public.staff;';
    END LOOP;
END $$;
