import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Ensure DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create postgres connection
const client = postgres(process.env.DATABASE_URL);

// Create drizzle instance
export const db = drizzle(client, { schema });
