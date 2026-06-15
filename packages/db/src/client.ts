import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"

const connectionString =
  process.env.DATABASE_URL ?? "postgres://beckon:beckon@localhost:5432/beckon"

// Reuse a single connection across hot reloads in development.
const globalForDb = globalThis as unknown as {
  __beckonPg?: ReturnType<typeof postgres>
}

const client = globalForDb.__beckonPg ?? postgres(connectionString, { max: 10 })
if (process.env.NODE_ENV !== "production") {
  globalForDb.__beckonPg = client
}

export const db = drizzle(client, { schema })
export type Database = typeof db
export { client as pgClient }
