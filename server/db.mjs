import './env.mjs';
import pg from 'pg';
const connection=process.env.DATABASE_URL?new URL(process.env.DATABASE_URL):null;
if(connection)connection.searchParams.set('sslmode','verify-full');
export const pool=connection?new pg.Pool({connectionString:connection.toString(),max:3,idleTimeoutMillis:10000,connectionTimeoutMillis:10000}):null;
export function requireDatabase(){if(!pool)throw Object.assign(new Error('Database is not configured.'),{status:503});return pool;}
