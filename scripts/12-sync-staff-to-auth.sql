-- Script untuk membuat user di Supabase Auth berdasarkan data staff
-- PENTING: Script ini harus dijalankan di Supabase SQL Editor, bukan di aplikasi

-- 1. Cek data staff yang ada
SELECT id, email, full_name, role, is_active 
FROM staff 
WHERE is_active = true;

-- 2. Insert users ke auth.users (ini hanya bisa dilakukan di Supabase dashboard)
-- Karena kita tidak bisa langsung insert ke auth.users via SQL,
-- kita perlu membuat user melalui Supabase dashboard atau API

-- 3. Sementara, kita buat tabel untuk tracking user yang perlu dibuat
CREATE TABLE IF NOT EXISTS staff_auth_sync (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    staff_email TEXT NOT NULL,
    staff_name TEXT NOT NULL,
    staff_role TEXT NOT NULL,
    auth_created BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Insert data staff yang perlu dibuat auth-nya
INSERT INTO staff_auth_sync (staff_email, staff_name, staff_role)
SELECT email, full_name, role
FROM staff 
WHERE is_active = true
ON CONFLICT DO NOTHING;

-- 5. Tampilkan data yang perlu dibuat auth-nya
SELECT * FROM staff_auth_sync WHERE auth_created = FALSE;
