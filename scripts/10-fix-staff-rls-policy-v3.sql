-- 1. Buat fungsi untuk mendapatkan role kustom user dari tabel staff
-- Fungsi ini akan dijalankan dengan hak akses definer (pembuat fungsi),
-- sehingga bisa membaca tabel 'staff' meskipun RLS diaktifkan untuk user biasa.
CREATE OR REPLACE FUNCTION get_user_custom_role(user_id uuid)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role FROM public.staff WHERE id = user_id;
  RETURN user_role;
END;
$$;

-- 2. Pastikan RLS diaktifkan untuk tabel staff
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

-- 3. Hapus kebijakan yang ada untuk menghindari konflik
DROP POLICY IF EXISTS "Allow all authenticated users to read staff" ON staff;
DROP POLICY IF EXISTS "Allow owner to create staff" ON staff;
DROP POLICY IF EXISTS "Allow admin to create kurir staff" ON staff;
DROP POLICY IF EXISTS "Allow owner to update any staff" ON staff;
DROP POLICY IF EXISTS "Allow admin to update kurir" ON staff;

-- 4. Buat kebijakan RLS yang baru menggunakan fungsi get_user_custom_role()

-- Kebijakan untuk SELECT (READ)
CREATE POLICY "Allow all authenticated users to read staff"
ON staff FOR SELECT
TO authenticated
USING (true); -- Semua user terautentikasi bisa membaca semua data staff

-- Kebijakan untuk INSERT (CREATE)
CREATE POLICY "Allow owner to create staff"
ON staff FOR INSERT
TO authenticated
WITH CHECK (
    get_user_custom_role(auth.uid()) = 'owner'
);

CREATE POLICY "Allow admin to create kurir staff"
ON staff FOR INSERT
TO authenticated
WITH CHECK (
    get_user_custom_role(auth.uid()) = 'admin'
    AND NEW.role = 'kurir' -- Admin hanya bisa membuat staff dengan role 'kurir'
);

-- Kebijakan untuk UPDATE (untuk soft delete dan edit)
-- Owner bisa mengupdate staff lain (kecuali diri sendiri)
CREATE POLICY "Allow owner to update any staff"
ON staff FOR UPDATE
TO authenticated
USING (
    get_user_custom_role(auth.uid()) = 'owner'
    AND OLD.id != auth.uid() -- Owner tidak bisa mengupdate entri mereka sendiri
)
WITH CHECK (
    get_user_custom_role(auth.uid()) = 'owner'
    AND NEW.id != auth.uid() -- Owner tidak bisa mengupdate entri mereka sendiri
);

-- Admin bisa mengupdate staff dengan role 'kurir'
CREATE POLICY "Allow admin to update kurir"
ON staff FOR UPDATE
TO authenticated
USING (
    get_user_custom_role(auth.uid()) = 'admin'
    AND OLD.role = 'kurir' -- Admin hanya bisa mengupdate staff dengan role 'kurir'
)
WITH CHECK (
    get_user_custom_role(auth.uid()) = 'admin'
    AND NEW.role = 'kurir' -- Admin hanya bisa mengupdate staff dengan role 'kurir'
);

-- Catatan: Pastikan kolom 'id' di tabel 'staff' Anda adalah UUID yang sama dengan 'auth.uid()'
-- dari user yang login di Supabase Authentication.
