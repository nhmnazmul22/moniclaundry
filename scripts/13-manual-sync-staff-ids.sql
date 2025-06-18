-- Update staff table dengan ID dari auth users yang baru dibuat
-- Jalankan setelah membuat users di Supabase Dashboard

-- Pertama, lihat ID dari auth users
SELECT id, email FROM auth.users WHERE email IN ('kyodaiadmin@gmail.com', 'nova.irvanardiansyah78@gmail.com');

-- Update staff table dengan ID yang benar
-- GANTI 'USER_ID_DARI_AUTH' dengan ID yang muncul dari query di atas

-- Contoh (ganti dengan ID yang sebenarnya):
-- UPDATE staff SET id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' WHERE email = 'kyodaiadmin@gmail.com';
-- UPDATE staff SET id = 'b2c3d4e5-f6g7-8901-bcde-f23456789012' WHERE email = 'nova.irvanardiansyah78@gmail.com';

-- Setelah update, cek hasilnya:
SELECT id, email, full_name, role FROM staff WHERE email IN ('kyodaiadmin@gmail.com', 'nova.irvanardiansyah78@gmail.com');
