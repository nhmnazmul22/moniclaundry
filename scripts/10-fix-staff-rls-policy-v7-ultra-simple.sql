-- SCRIPT RLS ULTRA SEDERHANA - FOKUS HANYA PADA LOGIN ADMIN
-- Tujuan: Membuat AuthContext bisa membaca tabel staff untuk mendapatkan role

-- 1. Hapus semua kebijakan RLS yang ada
DO $$
DECLARE
    policy_name TEXT;
BEGIN
    FOR policy_name IN (SELECT policyname FROM pg_policies WHERE tablename = 'staff' AND schemaname = 'public')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_name || '" ON public.staff;';
    END LOOP;
END $$;

-- 2. Buat fungsi sederhana untuk mendapatkan role
CREATE OR REPLACE FUNCTION get_user_role(user_id uuid)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    user_role text;
BEGIN
    SELECT role INTO user_role FROM public.staff WHERE id = user_id;
    RETURN user_role;
END;
$$;

-- 3. Aktifkan RLS
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

-- 4. HANYA KEBIJAKAN SELECT - Yang paling penting untuk login
CREATE POLICY "allow_read_staff"
ON public.staff FOR SELECT
TO authenticated
USING (true);

-- 5. KEBIJAKAN INSERT SEDERHANA - Tanpa kondisi kompleks
CREATE POLICY "allow_insert_staff"
ON public.staff FOR INSERT
TO authenticated
WITH CHECK (get_user_role(auth.uid()) = 'owner');

-- 6. KEBIJAKAN UPDATE PALING SEDERHANA - Tanpa OLD/NEW
CREATE POLICY "allow_update_staff"
ON public.staff FOR UPDATE
TO authenticated
USING (get_user_role(auth.uid()) = 'owner');

-- SELESAI - Tidak ada kebijakan kompleks lainnya dulu
-- Fokus: Login admin harus berfungsi dengan kebijakan SELECT di atas
