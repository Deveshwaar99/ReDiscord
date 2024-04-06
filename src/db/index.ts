import { Pool } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'
import * as schema from '@/db/schema'
// let dbInstance: NeonHttpDatabase<Record<string, never>>

// if (!dbInstance) {
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
let dbInstance = drizzle(pool, { schema })
// }

export { dbInstance as db }