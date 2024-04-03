import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'

let dbInstance

if (!dbInstance) {
  const connect = neon(process.env.DATABASE_URL!)
  dbInstance = drizzle(connect)
}

export { dbInstance as db }
