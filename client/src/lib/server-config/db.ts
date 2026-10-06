import { Pool, QueryResult, QueryResultRow } from 'pg';

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.SUPABASE_DB_URL;
const isRemote = Boolean(connectionString && !connectionString.includes('127.0.0.1') && !connectionString.includes('localhost'));
const isVercel = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

// Only instantiate pool if connectionString exists or if running locally where 127.0.0.1 is available
let pool: Pool | null = null;

if (connectionString) {
  pool = new Pool({
    connectionString,
    max: parseInt(process.env.DB_POOL_MAX || '20', 10),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    ssl: isRemote || process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });
} else if (!isVercel) {
  // Local development pool
  pool = new Pool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '5433', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'HiLosGeht123',
    database: process.env.DB_NAME || 'postgres',
    max: parseInt(process.env.DB_POOL_MAX || '50', 10),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });
}

if (pool) {
  pool.on('error', (err) => {
    console.error('⚠️ Unexpected error on idle PostgreSQL client:', err);
  });
}

export const db = {
  query: async <T extends QueryResultRow = any>(text: string, params?: any[]): Promise<QueryResult<T>> => {
    if (!pool) {
      throw new Error('Database connection not configured in Vercel environment (DATABASE_URL missing).');
    }
    const start = Date.now();
    const res = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development' && duration > 100) {
      console.log(`⏱️ Slow Query (${duration}ms): ${text.slice(0, 100)}`);
    }
    return res;
  },
  getClient: () => {
    if (!pool) {
      throw new Error('Database connection not configured in Vercel environment (DATABASE_URL missing).');
    }
    return pool.connect();
  },
  pool,
};

export default db;
