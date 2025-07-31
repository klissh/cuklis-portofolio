# 🔧 Setup Storage Cleanup - Panduan Lengkap

## ✅ Error TypeScript Sudah Diperbaiki

Semua error TypeScript telah diperbaiki dengan menambahkan type assertion `(error as Error).message`.

## 🔑 Cara Mendapatkan STORAGE_CLEANUP_API_KEY

### Opsi 1: Generate Otomatis (Recommended)

```bash
# 1. Generate API key baru
node scripts/generate-api-key.js

# 2. Copy API key yang dihasilkan (pilih Option 2 - Secure API Key)
# Contoh: sck_mdrhrcze_8f5df29dd0bb9ec30792087a5a4619db2185d422269d644b

# 3. API key sudah ditambahkan ke .env.local
```

### Opsi 2: Manual

Buat API key sendiri dengan string random yang aman:
```
STORAGE_CLEANUP_API_KEY=your_very_secure_random_string_here_32_chars_min
```

## 📁 File yang Sudah Dibuat/Diupdate

### ✅ Environment Variables
- `.env.local` - Sudah ditambahkan `STORAGE_CLEANUP_API_KEY`
- `.env.example` - Template untuk production

### ✅ Scripts
- `scripts/generate-api-key.js` - Generate API key secara otomatis
- `scripts/cleanup-storage.js` - Script manual cleanup (sudah diperbaiki untuk membaca .env.local)

### ✅ API Endpoints
- `src/app/api/storage-cleanup/route.ts` - API endpoint untuk cleanup
- Error TypeScript sudah diperbaiki

### ✅ Utils
- `src/utils/storageCleanup.ts` - Fungsi cleanup
- Error TypeScript sudah diperbaiki

### ✅ Admin UI
- Tab "Storage" sudah ditambahkan di admin dashboard
- Interface untuk cleanup manual

## 🚀 Cara Menggunakan

### 1. Via Admin Dashboard
1. Buka `http://localhost:3000/admin`
2. Login dengan credentials Anda
3. Klik tab "Storage"
4. Pilih "Cleanup File Tidak Terpakai" atau "Cleanup File Lama"

### 2. Via NPM Scripts
```bash
# Cleanup file tidak terpakai
npm run cleanup:storage

# Cleanup file lama (30+ hari)
npm run cleanup:storage:old
```

### 3. Via API Direct
```bash
# POST request dengan API key
curl -X POST http://localhost:3000/api/storage-cleanup \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_api_key_here" \
  -d '{"mode": "unused"}'
```

## 🔒 Keamanan

- ✅ API key sudah di-generate secara aman
- ✅ API endpoint dilindungi dengan validasi API key
- ✅ File `.env.local` tidak akan di-commit ke git
- ✅ Error handling yang proper

## 🎯 Fitur yang Tersedia

1. **Cleanup Otomatis**: File terhapus otomatis saat delete project/certificate/experience
2. **Cleanup Manual**: Via admin dashboard atau script
3. **Cleanup Terjadwal**: Bisa diatur dengan cron job
4. **Mode Cleanup**:
   - `unused`: Hapus semua file tidak terpakai
   - `old`: Hapus file lama (30+ hari) yang tidak terpakai

## 🐛 Troubleshooting

### Error: "STORAGE_CLEANUP_API_KEY environment variable is required"
**Solusi**: Pastikan file `.env.local` ada dan berisi API key yang valid.

### Error: "Request error" saat menjalankan script
**Solusi**: 
1. Pastikan server Next.js sedang berjalan (`npm run dev`)
2. Cek apakah port 3000 tersedia
3. Cek koneksi internet jika menggunakan URL production

### Tab Storage tidak muncul
**Solusi**: Restart development server setelah menambahkan API key.

## ✨ Status Implementasi

- ✅ API endpoint storage cleanup
- ✅ Cleanup otomatis setelah delete
- ✅ Script manual cleanup
- ✅ Admin UI tab Storage
- ✅ Environment variables setup
- ✅ Error TypeScript diperbaiki
- ✅ Dokumentasi lengkap
- ✅ Security dengan API key

**Semua fitur storage cleanup sudah siap digunakan!** 🎉