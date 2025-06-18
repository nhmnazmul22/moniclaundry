-- 1. Fungsi untuk mendapatkan role kustom user dari tabel staff
--    Fungsi ini akan dijalankan dengan hak akses definer (pembuat fungsi),
--    sehingga bisa membaca tabel 'staff' meskipun RLS diaktifkan untuk user biasa.
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
DROP POLICY IF EXISTS "Allow all staff select" ON staff;
DROP POLICY IF EXISTS "Allow owner to insert staff" ON staff;
DROP POLICY IF EXISTS "Allow admin to insert kurir staff" ON staff;
DROP POLICY IF EXISTS "Allow owner to update any staff except self" ON staff;
DROP POLICY IF EXISTS "Allow admin to update kurir staff" ON staff;

-- 4. Buat kebijakan RLS baru

-- Kebijakan SELECT: Semua user terautentikasi bisa melihat semua staff
CREATE POLICY "Allow all staff select"
ON staff FOR SELECT
TO authenticated
USING (true);

-- Kebijakan INSERT:
-- Owner bisa menambah staff dengan role apapun
CREATE POLICY "Allow owner to insert staff"
ON staff FOR INSERT
TO authenticated
WITH CHECK (
    get_user_custom_role(auth.uid()) = 'owner'
);

-- Admin bisa menambah staff dengan role 'admin' atau 'kurir'
CREATE POLICY "Allow admin to insert staff (admin/kurir)"
ON staff FOR INSERT
TO authenticated
WITH CHECK (
    get_user_custom_role(auth.uid()) = 'admin'
    AND NEW.role IN ('admin', 'kurir')
);

-- Kebijakan UPDATE: (untuk soft delete dan edit)
-- Owner bisa mengupdate staff lain (kecuali diri sendiri)
CREATE POLICY "Allow owner to update any staff except self"
ON staff FOR UPDATE
TO authenticated
USING (
    get_user_custom_role(auth.uid()) = 'owner'
    AND OLD.id != auth.uid() -- Owner tidak bisa mengupdate entri mereka sendiri
)
WITH CHECK (
    get_user_custom_role(auth.uid()) = 'owner'
    AND NEW.id != auth.uid() -- Owner tidak bisa mengupdate entri mereka sendiri (setelah update)
);

-- Admin bisa mengupdate staff dengan role 'kurir'
CREATE POLICY "Allow admin to update kurir staff"
ON staff FOR UPDATE
TO authenticated
USING (
    get_user_custom_role(auth.uid()) = 'admin'
    AND OLD.role = 'kurir' -- Admin hanya bisa mengupdate staff dengan role 'kurir'
)
WITH CHECK (
    get_user_custom_role(auth.uid()) = 'admin'
    AND NEW.role = 'kurir' -- Admin hanya bisa mengupdate staff dengan role 'kurir' (setelah update)
);

-- Kebijakan DELETE: (jika Anda ingin hard delete, saat ini kita pakai soft delete)
-- Owner bisa menghapus staff lain (kecuali diri sendiri)
CREATE POLICY "Allow owner to delete any staff except self"
ON staff FOR DELETE
TO authenticated
USING (
    get_user_custom_role(auth.uid()) = 'owner'
    AND OLD.id != auth.uid()
);

-- Admin bisa menghapus staff dengan role 'kurir'
CREATE POLICY "Allow admin to delete kurir staff"
ON staff FOR DELETE
TO authenticated
USING (
    get_user_custom_role(auth.uid()) = 'admin'
    AND OLD.role = 'kurir'
);
