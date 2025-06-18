-- 0. Hapus semua kebijakan RLS yang ada untuk tabel staff untuk menghindari konflik
-- Pastikan Anda menjalankan ini sebagai superuser atau pemilik tabel jika ada masalah izin.
-- Anda mungkin perlu menjalankan setiap DROP POLICY secara terpisah jika ada dependensi.
DO $$
DECLARE
    policy_name TEXT;
BEGIN
    FOR policy_name IN (SELECT policyname FROM pg_policies WHERE tablename = 'staff' AND schemaname = 'public')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_name || '" ON public.staff;';
    END LOOP;
END $$;

-- 1. Buat fungsi untuk mendapatkan role kustom user dari tabel staff
-- Fungsi ini akan dijalankan dengan hak akses definer (pembuat fungsi),
-- sehingga bisa membaca tabel 'staff' meskipun RLS diaktifkan untuk user biasa.
CREATE OR REPLACE FUNCTION get_user_custom_role(user_id uuid)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER STABLE AS $$
-- STABLE disarankan untuk fungsi yang tidak mengubah database dan hasilnya sama untuk input yang sama dalam satu query.
DECLARE
    user_role text;
BEGIN
    -- Ambil role dari tabel public.staff berdasarkan user_id (yang merupakan auth.uid())
    SELECT role INTO user_role FROM public.staff WHERE id = user_id;
    RETURN user_role;
END;
$$;

-- 2. Pastikan RLS diaktifkan untuk tabel staff
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff FORCE ROW LEVEL SECURITY; -- Pastikan RLS diterapkan bahkan untuk pemilik tabel

-- 3. Kebijakan SELECT: Semua user terautentikasi bisa melihat semua data staff
-- Ini penting agar AuthContext bisa mengambil userProfile.role
CREATE POLICY "Allow authenticated users to read staff"
ON public.staff FOR SELECT
TO authenticated
USING (true);

-- 4. Kebijakan INSERT yang SANGAT SEDERHANA:
-- Hanya owner yang bisa menambah staff baru.
-- Kita akan membuat kondisi WITH CHECK sesederhana mungkin.
CREATE POLICY "Allow owner to insert any staff"
ON public.staff FOR INSERT
TO authenticated
WITH CHECK (
    (SELECT get_user_custom_role(auth.uid())) = 'owner'
);

-- 5. Kebijakan UPDATE yang SANGAT SEDERHANA (untuk soft delete/deaktivasi):
-- Hanya owner yang bisa mengupdate (menonaktifkan) staff lain (bukan diri sendiri).
CREATE POLICY "Allow owner to update (deactivate) other staff"
ON public.staff FOR UPDATE
TO authenticated
USING (
    (SELECT get_user_custom_role(auth.uid())) = 'owner' AND
    OLD.id != auth.uid() -- Owner tidak bisa mengupdate diri sendiri
)
WITH CHECK (
    (SELECT get_user_custom_role(auth.uid())) = 'owner' AND
    NEW.id != auth.uid() -- Pastikan setelah update, ID tidak berubah menjadi ID owner (meskipun tidak relevan untuk soft delete)
    -- Untuk soft delete, yang penting adalah OLD.id != auth.uid() di USING clause.
    -- Kondisi WITH CHECK di sini lebih untuk integritas data jika ada field lain yang diubah.
    -- Jika hanya is_active yang diubah, kondisi NEW.role = OLD.role bisa ditambahkan jika role tidak boleh diubah saat deaktivasi.
);


-- CATATAN PENTING:
-- Kebijakan untuk ADMIN akan ditambahkan setelah ini dipastikan berfungsi.
-- Fokus utama adalah membuat login admin dan fungsi dasar owner berjalan.
-- Jika script ini masih error, masalahnya mungkin lebih dalam dari sintaks RLS biasa.
