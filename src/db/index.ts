import 'server-only' //"DOESN'T WORK WITH PAGES ROUTER"

import * as schema from '@/db/schema'
import { Pool } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'

// pool cooenction
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const dbInstance = drizzle(pool, { schema })

export { dbInstance as db }

//http connection
// const sql = neon(process.env.DRIZZLE_DATABASE_URL!)
// const db = drizzle(sql, { schema })
