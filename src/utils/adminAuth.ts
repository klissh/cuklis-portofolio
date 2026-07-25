import crypto from 'crypto';

/**
 * Modul autentikasi admin.
 *
 * SEBELUM: session token dibuat dengan Math.random()+Date.now() lalu disimpan
 * sebagai cookie, tapi validasi di semua route HANYA mengecek apakah cookie
 * "admin_session" ada isinya (`if (session && session.value)`). Ini berarti
 * siapa pun bisa membuka DevTools, membuat cookie "admin_session=apapun",
 * dan langsung dianggap admin — tanpa perlu tahu password.
 *
 * SESUDAH: token ditandatangani dengan HMAC-SHA256 menggunakan secret di
 * server (ADMIN_SESSION_SECRET). Token berisi waktu kedaluwarsa + signature,
 * sehingga:
 *   1. Tidak bisa dipalsukan tanpa mengetahui ADMIN_SESSION_SECRET.
 *   2. Otomatis kedaluwarsa (tidak valid selamanya walau cookie dicuri).
 *   3. Perbandingan signature memakai timingSafeEqual agar tahan timing attack.
 */

const SESSION_DURATION_MS = 60 * 60 * 1000; // 1 jam, selaras dengan maxAge cookie

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    // Sengaja throw, bukan fallback ke default: jika secret belum di-set,
    // lebih aman aplikasi gagal jelas daripada diam-diam memakai token yang
    // gampang ditebak.
    throw new Error(
      'ADMIN_SESSION_SECRET belum di-set di environment variables. ' +
        'Tambahkan nilai acak yang panjang (misal hasil `openssl rand -hex 32`).'
    );
  }
  return secret;
}

function sign(payload: string): string {
  return crypto.createHmac('sha256', getSecret()).update(payload).digest('hex');
}

/** Membuat session token admin yang baru dan valid selama SESSION_DURATION_MS. */
export function createSessionToken(): string {
  const expiry = Date.now() + SESSION_DURATION_MS;
  const payload = String(expiry);
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

/**
 * Memvalidasi session token.
 * Mengecek DUA hal: signature-nya valid (tidak dipalsukan) DAN belum kedaluwarsa.
 */
export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;

  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payload, signature] = parts;
  if (!payload || !signature) return false;

  let expected: string;
  try {
    expected = sign(payload);
  } catch {
    return false;
  }

  const sigBuffer = Buffer.from(signature, 'hex');
  const expectedBuffer = Buffer.from(expected, 'hex');
  if (sigBuffer.length !== expectedBuffer.length) return false;
  if (!crypto.timingSafeEqual(sigBuffer, expectedBuffer)) return false;

  const expiry = parseInt(payload, 10);
  if (!Number.isFinite(expiry) || Date.now() > expiry) return false;

  return true;
}

/** Perbandingan string timing-safe, dipakai untuk mencocokkan username/password admin. */
export function timingSafeStringEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}
