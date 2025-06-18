# 🚀 Panduan Lengkap Monic Laundry POS - Untuk Pemula Windows

## 📋 LANGKAH 1: INSTALL TOOLS YANG DIBUTUHKAN

### A. Install Node.js
1. Buka browser, kunjungi: https://nodejs.org
2. Download versi LTS (yang direkomendasikan)
3. Jalankan file installer (.msi)
4. Ikuti wizard instalasi (next, next, install)
5. Test instalasi:
   - Tekan `Win + R`, ketik `cmd`, Enter
   - Ketik: `node --version`
   - Ketik: `npm --version`
   - Jika muncul nomor versi, berarti berhasil!

### B. Install Git
1. Kunjungi: https://git-scm.com/download/win
2. Download Git for Windows
3. Install dengan setting default
4. Test: buka Command Prompt, ketik `git --version`

### C. Install Visual Studio Code (Opsional tapi direkomendasikan)
1. Kunjungi: https://code.visualstudio.com
2. Download untuk Windows
3. Install dengan setting default

### D. Install Android Studio (Untuk build Android)
1. Kunjungi: https://developer.android.com/studio
2. Download Android Studio
3. Install (butuh waktu lama, sabar ya!)
4. Buka Android Studio, ikuti setup wizard
5. Install Android SDK (pilih API level 24 atau lebih tinggi)

## 📋 LANGKAH 2: SETUP PROJECT

### A. Download Source Code
1. Buka Command Prompt (Win + R, ketik cmd)
2. Pindah ke folder yang diinginkan:
   \`\`\`
   cd C:\Users\YourName\Documents
   \`\`\`
3. Clone project (atau download ZIP dari GitHub):
   \`\`\`
   git clone https://github.com/your-username/monic-laundry-pos.git
   cd monic-laundry-pos
   \`\`\`

### B. Install Dependencies
\`\`\`bash
npm install
\`\`\`
(Tunggu sampai selesai, bisa 5-10 menit)

## 📋 LANGKAH 3: SETUP DATABASE (SUPABASE)

### A. Buat Account Supabase
1. Kunjungi: https://supabase.com
2. Klik "Start your project"
3. Sign up dengan email/GitHub
4. Klik "New Project"
5. Isi:
   - Name: monic-laundry-pos
   - Database Password: (buat password kuat)
   - Region: Southeast Asia (Singapore)
6. Klik "Create new project"
7. Tunggu 2-3 menit sampai project ready

### B. Setup Database
1. Di dashboard Supabase, klik "SQL Editor"
2. Klik "New Query"
3. Copy paste script dari file `scripts/01-create-database.sql`
4. Klik "Run" (tombol play)
5. Ulangi untuk file `scripts/02-seed-data.sql`

### C. Get API Keys
1. Di dashboard Supabase, klik "Settings" > "API"
2. Copy:
   - Project URL
   - anon public key
   - service_role key (secret)

## 📋 LANGKAH 4: SETUP ENVIRONMENT

### A. Buat File Environment
1. Di folder project, buat file baru: `.env.local`
2. Isi dengan:
\`\`\`
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
\`\`\`
3. Ganti dengan API keys dari Supabase tadi

## 📋 LANGKAH 5: TEST APLIKASI

### A. Jalankan Web App
\`\`\`bash
npm run dev
\`\`\`
1. Tunggu sampai muncul "Ready - started server on 0.0.0.0:3000"
2. Buka browser: http://localhost:3000
3. Login dengan:
   - Email: owner@moniclaundry.com
   - Password: password123

### B. Test Fitur
- Dashboard harus muncul
- Menu sidebar berfungsi
- Data demo tampil

## 📋 LANGKAH 6: BUILD APLIKASI

### A. Build Web Application
\`\`\`bash
# Stop development server dulu (Ctrl+C)
npm run build
\`\`\`

### B. Build Desktop App (Electron)
\`\`\`bash
npm run electron-build
\`\`\`
Hasil: folder `dist-electron` berisi installer Windows (.exe)

### C. Build Android App
1. Buka Android Studio
2. Open project: pilih folder `android` dalam project
3. Tunggu Gradle sync selesai
4. Klik "Build" > "Build Bundle(s) / APK(s)" > "Build APK(s)"
5. Hasil: file APK di `android/app/build/outputs/apk/`

## 📋 LANGKAH 7: INSTALL & TEST

### A. Test Desktop App
1. Buka folder `dist-electron`
2. Double-click file installer (.exe)
3. Install aplikasi
4. Jalankan dari Start Menu

### B. Test Android App
1. Enable "Developer Options" di HP Android
2. Enable "USB Debugging"
3. Sambungkan HP ke PC
4. Buka Command Prompt di folder project:
\`\`\`bash
cd android
adb install app/build/outputs/apk/debug/app-debug.apk
\`\`\`

## 🔧 TROUBLESHOOTING UNTUK PEMULA

### Masalah Umum & Solusi

#### 1. "npm tidak dikenali"
**Solusi:** Install ulang Node.js, restart Command Prompt

#### 2. "Permission denied"
**Solusi:** Jalankan Command Prompt sebagai Administrator

#### 3. "Module not found"
**Solusi:** 
\`\`\`bash
rm -rf node_modules
npm install
\`\`\`

#### 4. Web app tidak bisa akses database
**Solusi:** 
- Cek file `.env.local`
- Pastikan Supabase URL dan keys benar
- Cek koneksi internet

#### 5. Android build gagal
**Solusi:**
- Pastikan Android Studio terinstall lengkap
- Set environment variable ANDROID_HOME
- Restart Android Studio

#### 6. Electron build gagal
**Solusi:**
\`\`\`bash
npm install electron --save-dev
npm rebuild
\`\`\`

## 📱 CARA DISTRIBUSI

### Web App
1. Deploy ke Vercel (gratis):
\`\`\`bash
npm install -g vercel
vercel login
vercel --prod
\`\`\`

### Desktop App
1. File installer ada di `dist-electron/`
2. Upload ke Google Drive atau hosting file
3. Share link download

### Android App
1. File APK ada di `android/app/build/outputs/apk/`
2. Upload ke Google Drive
3. Install manual di HP Android

## 🎯 CHECKLIST SUKSES

- [ ] Node.js terinstall
- [ ] Git terinstall  
- [ ] Project ter-download
- [ ] Dependencies terinstall
- [ ] Supabase database setup
- [ ] Environment variables setup
- [ ] Web app jalan di localhost:3000
- [ ] Bisa login dengan akun demo
- [ ] Dashboard tampil dengan data
- [ ] Build web berhasil
- [ ] Build desktop berhasil
- [ ] Build Android berhasil
- [ ] Aplikasi bisa diinstall dan jalan

## 📞 BANTUAN LEBIH LANJUT

Jika masih ada masalah:
1. Screenshot error message
2. Copy paste error text
3. Sebutkan di langkah mana stuck
4. Sebutkan versi Windows yang dipakai

---
**🎉 Selamat! Anda berhasil build aplikasi Monic Laundry POS!**
\`\`\`

Sekarang mari buat script otomatis untuk pemula:

\`\`\`batch file="setup-pemula.bat"
@echo off
echo ========================================
echo    SETUP MONIC LAUNDRY POS - PEMULA
echo ========================================
echo.

echo [1/5] Mengecek Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js belum terinstall!
    echo Silakan download dari: https://nodejs.org
    pause
    exit /b 1
) else (
    echo ✅ Node.js sudah terinstall
)

echo.
echo [2/5] Mengecek Git...
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git belum terinstall!
    echo Silakan download dari: https://git-scm.com
    pause
    exit /b 1
) else (
    echo ✅ Git sudah terinstall
)

echo.
echo [3/5] Install dependencies...
npm install
if %errorlevel% neq 0 (
    echo ❌ Gagal install dependencies!
    pause
    exit /b 1
) else (
    echo ✅ Dependencies berhasil diinstall
)

echo.
echo [4/5] Mengecek file environment...
if not exist ".env.local" (
    echo ❌ File .env.local belum ada!
    echo Silakan buat file .env.local dengan isi:
    echo NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
    echo NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
    echo SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
    pause
    exit /b 1
) else (
    echo ✅ File .env.local sudah ada
)

echo.
echo [5/5] Setup selesai!
echo.
echo Langkah selanjutnya:
echo 1. Jalankan: npm run dev
echo 2. Buka browser: http://localhost:3000
echo 3. Login dengan: owner@moniclaundry.com / password123
echo.
pause
