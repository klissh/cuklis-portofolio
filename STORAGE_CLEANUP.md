# Storage Cleanup System

Sistem ini secara otomatis menghapus file-file yang tidak terpakai di Supabase Storage untuk menghemat ruang penyimpanan dan menjaga kebersihan bucket.

## Fitur

### 1. Cleanup Otomatis
- **Trigger**: Dijalankan otomatis setelah operasi delete (projects, certificates, experiences)
- **Fungsi**: Menghapus file yang tidak lagi direferensikan di database
- **Bucket**: `project-images`, `certificate-images`, `experience-images`

### 2. Cleanup Manual
- **API Endpoint**: `/api/storage-cleanup`
- **Methods**: GET (untuk cron jobs), POST (untuk manual dengan opsi)
- **Keamanan**: Dilindungi dengan API key

### 3. Cleanup Terjadwal
- **Script**: `scripts/cleanup-storage.js`
- **Mode**: 
  - `unused`: Hapus semua file yang tidak digunakan
  - `old`: Hapus file lama yang tidak digunakan (default: 30 hari)

## Setup

### 1. Environment Variables
Tambahkan ke file `.env.local`:
```bash
STORAGE_CLEANUP_API_KEY=your_secret_api_key_here
```

### 2. Generate API Key
```bash
# Contoh generate random API key
node -e "console.log('sk_cleanup_' + require('crypto').randomBytes(16).toString('hex'))"
```

## Penggunaan

### 1. Cleanup Manual via API
```bash
# Cleanup semua file yang tidak digunakan
curl -X POST http://localhost:3000/api/storage-cleanup \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_api_key" \
  -d '{"mode": "unused"}'

# Cleanup file lama (lebih dari 30 hari)
curl -X POST http://localhost:3000/api/storage-cleanup \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_api_key" \
  -d '{"mode": "old", "daysOld": 30}'
```

### 2. Cleanup via Script
```bash
# Cleanup semua file yang tidak digunakan
node scripts/cleanup-storage.js

# Cleanup file lama (lebih dari 7 hari)
node scripts/cleanup-storage.js --mode=old --days=7
```

### 3. Cleanup via Cron Job
```bash
# Tambahkan ke crontab untuk cleanup harian
0 2 * * * curl -X GET http://localhost:3000/api/storage-cleanup -H "x-api-key: your_api_key"
```

## Cara Kerja

### 1. Identifikasi File yang Digunakan
- Scan database untuk semua referensi file di kolom `image`
- Extract nama file dari URL Supabase Storage
- Buat daftar file yang masih digunakan

### 2. Identifikasi File di Storage
- List semua file di bucket storage
- Filter file berdasarkan kriteria (unused/old)

### 3. Hapus File yang Tidak Digunakan
- Bandingkan file di storage dengan file yang digunakan
- Hapus file yang tidak ada di daftar "digunakan"
- Log hasil operasi

## Keamanan

### 1. API Key Protection
- Semua endpoint dilindungi dengan API key
- API key harus disertakan di header `x-api-key`

### 2. Error Handling
- Cleanup error tidak mempengaruhi operasi delete utama
- Log error untuk monitoring

### 3. Safe Operations
- Tidak menghapus file `.emptyFolderPlaceholder`
- Validasi sebelum delete

## Monitoring

### 1. Console Logs
```javascript
// Success
'Storage cleanup completed after project deletion'
'Successfully deleted 5 files from project-images'

// Error
'Error during storage cleanup: [error message]'
```

### 2. API Response
```json
{
  "success": true,
  "deletedCount": 5
}
```

## Troubleshooting

### 1. API Key Error
```
Error: Unauthorized: Invalid API key
```
**Solusi**: Pastikan `STORAGE_CLEANUP_API_KEY` sudah diset dengan benar

### 2. Storage Permission Error
```
Error: RLS policy violation
```
**Solusi**: Pastikan Supabase storage policy mengizinkan delete operations

### 3. Network Error
```
Error: Request timeout
```
**Solusi**: Periksa koneksi internet dan status Supabase

## Best Practices

### 1. Backup Sebelum Cleanup
- Backup file penting sebelum menjalankan cleanup
- Test di environment development terlebih dahulu

### 2. Monitor Storage Usage
- Pantau penggunaan storage di Supabase dashboard
- Set alert untuk usage yang tinggi

### 3. Cleanup Terjadwal
- Jalankan cleanup secara berkala (harian/mingguan)
- Gunakan mode `old` untuk cleanup yang lebih aman

### 4. Logging
- Monitor log untuk memastikan cleanup berjalan dengan baik
- Set up alerting untuk error cleanup

## Integrasi dengan Deployment

### 1. Vercel
Tambahkan environment variable di Vercel dashboard:
```
STORAGE_CLEANUP_API_KEY=your_api_key
```

### 2. Cron Jobs (Vercel Pro)
```javascript
// vercel.json
{
  "crons": [
    {
      "path": "/api/storage-cleanup",
      "schedule": "0 2 * * *"
    }
  ]
}
```

### 3. External Cron Services
- **Cron-job.org**: Setup HTTP cron job ke API endpoint
- **GitHub Actions**: Setup workflow untuk cleanup terjadwal
- **Uptime Robot**: Monitor dan trigger cleanup

## Estimasi Penghematan

### 1. File Size Average
- Project images: ~500KB per file
- Certificate images: ~200KB per file  
- Experience images: ~300KB per file

### 2. Cleanup Frequency
- **Harian**: Optimal untuk situs dengan update frequent
- **Mingguan**: Cukup untuk situs dengan update moderate
- **Bulanan**: Minimum untuk maintenance

### 3. Storage Cost Savings
- Supabase: $0.021 per GB per month
- Cleanup 100MB unused files = $0.002 savings per month
- Cleanup 1GB unused files = $0.021 savings per month