import * as schema from '@/db/schema'
import { Pool } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'

// pool cooenction
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const dbInstance = drizzle(pool, { schema })

export { dbInstance as db }
