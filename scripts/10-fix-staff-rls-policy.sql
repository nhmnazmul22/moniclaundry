-- Pastikan RLS diaktifkan untuk tabel staff
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

-- Hapus kebijakan yang ada untuk menghindari konflik
DROP POLICY IF EXISTS "Allow all authenticated users to read staff" ON staff;
DROP POLICY IF EXISTS "Allow owner to manage all staff" ON staff;
DROP POLICY IF EXISTS "Allow admin to manage kurir staff" ON staff;
DROP POLICY IF EXISTS "Allow staff to view their own profile" ON staff;
DROP POLICY IF EXISTS "Allow owner to create staff" ON staff;
DROP POLICY IF EXISTS "Allow admin to create kurir staff" ON staff;
DROP POLICY IF EXISTS "Allow owner to update any staff except self" ON staff;
DROP POLICY IF EXISTS "Allow admin to update kurir staff" ON staff;


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
    (SELECT role FROM users WHERE id = auth.uid()) = 'owner'
);

CREATE POLICY "Allow admin to create kurir staff"
ON staff FOR INSERT
TO authenticated
WITH CHECK (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
    AND NEW.role = 'kurir' -- Admin hanya bisa membuat staff dengan role 'kurir'
);

-- Kebijakan untuk UPDATE (untuk soft delete dan edit)
CREATE POLICY "Allow owner to update any staff except self"
ON staff FOR UPDATE
TO authenticated
USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'owner'
    AND id != auth.uid() -- Owner tidak bisa mengupdate entri mereka sendiri (untuk mencegah self-deactivation)
);

CREATE POLICY "Allow admin to update kurir staff"
ON staff FOR UPDATE
TO authenticated
USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
    AND role = 'kurir' -- Admin hanya bisa mengupdate staff dengan role 'kurir'
);
