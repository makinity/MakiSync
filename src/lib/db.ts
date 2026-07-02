import { Pool } from 'pg';

// Use individual params to avoid URL-parsing issues with special chars in password.
// Falls back to connectionString if the individual vars aren't set.
const pool = process.env.DB_HOST
  ? new Pool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT ?? '5432'),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: { rejectUnauthorized: false },
    })
  : new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });

export default pool;
