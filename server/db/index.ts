import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema';

// Hardcoded connection string (as requested, replace with environment variables in production)
const connectionString = 'postgresql://postgres:123@localhost:5432/ecommerce'; 

export const pool = new pg.Pool({
  connectionString,
});

export const db = drizzle(pool, { schema });

// Export pool for session store
export { pool as sessionPool }; 