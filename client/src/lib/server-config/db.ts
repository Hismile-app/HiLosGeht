import { Pool, QueryResult, QueryResultRow } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5433', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'HiLosGeht123',
  database: process.env.DB_NAME || 'postgres',
  max: parseInt(process.env.DB_POOL_MAX || '50', 10),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('⚠️ Unexpected error on idle PostgreSQL client:', err);
});

export const db = {
  query: async <T extends QueryResultRow = any>(text: string, params?: any[]): Promise<QueryResult<T>> => {
    const start = Date.now();
    // Prepared statements explicitly disabled for Transaction Pooler compatibility
    const res = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development' && duration > 100) {
      console.log(`⏱️ Slow Query (${duration}ms): ${text.slice(0, 100)}`);
    }
    return res;
  },
  getClient: () => pool.connect(),
  pool,
};

export default db;
