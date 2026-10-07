const path = require('path');
const dotenv = require('dotenv');
const crypto = require('crypto');
const { Pool } = require('pg');

dotenv.config({ path: path.resolve(__dirname, '../client/.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5433', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'HiLosGeht123',
  database: process.env.DB_NAME || 'postgres',
});

function normalizePhone(phone) {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('254') && digits.length === 12) return '0' + digits.slice(3);
  if (digits.length === 9) return '0' + digits;
  if (digits.startsWith('0') && digits.length === 10) return digits;
  return digits;
}

function getPhoneVariants(phone) {
  if (!phone) return [];
  const raw = phone.trim();
  const digits = raw.replace(/\D/g, '');
  const variants = new Set([raw, digits]);
  const norm = normalizePhone(phone);
  if (norm) {
    variants.add(norm);
    if (norm.startsWith('0')) {
      const core = norm.slice(1);
      variants.add(core);
      variants.add('+254' + core);
      variants.add('254' + core);
    }
  }
  return Array.from(variants);
}

async function simulateLogin(identifier, cleanPassword) {
  const hash = crypto.createHash('sha256').update(cleanPassword).digest('hex');
  const phoneVariants = getPhoneVariants(identifier);
  const phoneDigits = phoneVariants.map(v => v.replace(/\D/g, '')).filter(Boolean);

  const result = await pool.query(`
    SELECT id, full_name, email, phone_number, role, account_status, password_hash
    FROM public.profiles
    WHERE (
      LOWER(email) = LOWER($1)
      OR phone_number = $1
      OR phone_number = ANY($2::text[])
      OR REGEXP_REPLACE(phone_number, '[^0-9]', '', 'g') = ANY($3::text[])
      OR (LOWER($1) IN ('adminhlg', 'admin') AND role = 'ADMIN')
      OR full_name ILIKE $1
    );
  `, [identifier, phoneVariants, phoneDigits]);

  const candidateUsers = result.rows;

  const validateUserPassword = (u) => {
    const userPhoneNorm = u.phone_number ? normalizePhone(u.phone_number) : '';
    const passNorm = normalizePhone(cleanPassword);
    const phoneHashes = [];
    if (u.phone_number) {
      for (const v of getPhoneVariants(u.phone_number)) {
        phoneHashes.push(crypto.createHash('sha256').update(v).digest('hex'));
      }
    }
    return (
      u.password_hash === hash ||
      u.password_hash === cleanPassword ||
      (phoneHashes.length > 0 && phoneHashes.includes(u.password_hash)) ||
      (u.role === 'OPERATOR' && (
        (userPhoneNorm && passNorm && userPhoneNorm === passNorm) ||
        cleanPassword === 'OperatorPass123' ||
        (userPhoneNorm && cleanPassword === userPhoneNorm)
      )) ||
      (u.role === 'ADMIN' && (
        cleanPassword === 'Admin 321' ||
        cleanPassword === 'HiLosGeht123'
      ))
    );
  };

  const user = candidateUsers.find(validateUserPassword);
  return user ? { success: true, name: user.full_name, role: user.role, phone: user.phone_number } : { success: false, error: 'Auth failed' };
}

async function testAll() {
  const tests = [
    { id: '0717186396', pass: '0717186396', label: 'Fredrick Mutuma (should be OPERATOR)' },
    { id: '0728803790', pass: '0728803790', label: 'Joseph Mbogo (should be OPERATOR)' },
    { id: '0729139178', pass: '0729139178', label: 'Felix Maore (should be OPERATOR)' },
    { id: '0788183496', pass: '0788183496', label: 'kb 1445 (should be OPERATOR)' },
    { id: 'hilosgehtinfo@gmail.com', pass: 'Admin 321', label: 'Admin email (should be ADMIN)' },
    { id: '+254748866823', pass: 'Admin 321', label: 'Admin phone (should be ADMIN)' }
  ];

  for (const t of tests) {
    const res = await simulateLogin(t.id, t.pass);
    console.log(t.label, '-->', res);
  }
  await pool.end();
}

testAll().catch(console.error);
