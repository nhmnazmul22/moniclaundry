# 🔧 Troubleshooting Windows - Monic Laundry POS

## ❌ MASALAH UMUM & SOLUSI

### 1. "npm tidak dikenali sebagai perintah"
**Penyebab:** Node.js belum terinstall atau PATH belum di-set

**Solusi:**
1. Download Node.js dari https://nodejs.org
2. Install dengan centang "Add to PATH"
3. Restart Command Prompt
4. Test: `node --version`

### 2. "Access denied" atau "Permission denied"
**Penyebab:** Tidak ada permission Administrator

**Solusi:**
1. Klik kanan Command Prompt
2. Pilih "Run as administrator"
3. Jalankan perintah lagi

### 3. "Module not found" setelah npm install
**Penyebab:** Dependencies tidak terinstall lengkap

**Solusi:**
\`\`\`cmd
rmdir /s node_modules
del package-lock.json
npm install
\`\`\`

### 4. Build Electron gagal di Windows
**Penyebab:** Missing build tools

**Solusi:**
\`\`\`cmd
npm install --global windows-build-tools
npm rebuild
\`\`\`

### 5. Android build gagal
**Penyebab:** Android SDK tidak di-set

**Solusi:**
1. Buka System Properties (Win + Pause)
2. Advanced System Settings
3. Environment Variables
4. Tambah variable baru:
   - Name: ANDROID_HOME
   - Value: C:\Users\YourName\AppData\Local\Android\Sdk
5. Restart Command Prompt

### 6. "Port 3000 already in use"
**Penyebab:** Ada aplikasi lain yang pakai port 3000

**Solusi:**
\`\`\`cmd
netstat -ano | findstr :3000
taskkill /PID [PID_NUMBER] /F
\`\`\`

### 7. Supabase connection error
**Penyebab:** Environment variables salah

**Solusi:**
1. Cek file `.env.local`
2. Pastikan tidak ada spasi extra
3. Pastikan URL dan keys benar
4. Restart development server

### 8. Antivirus block aplikasi
**Penyebab:** Windows Defender atau antivirus lain

**Solusi:**
1. Tambahkan folder project ke exclusion list
2. Atau disable real-time protection sementara

## 🛠️ TOOLS DEBUGGING

### Cek Instalasi
\`\`\`cmd
node --version
npm --version
git --version
\`\`\`

### Cek Port yang Digunakan
\`\`\`cmd
netstat -ano | findstr :3000
\`\`\`

### Cek Environment Variables
\`\`\`cmd
echo %ANDROID_HOME%
echo %PATH%
\`\`\`

### Clear Cache
\`\`\`cmd
npm cache clean --force
\`\`\`

## 📞 BANTUAN LEBIH LANJUT

Jika masih bermasalah:
1. Screenshot error message
2. Copy paste full error text
3. Sebutkan versi Windows (Win 10/11)
4. Sebutkan langkah yang sedang dilakukan
