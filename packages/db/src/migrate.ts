import { fileURLToPath } from "node:url"
import { drizzle } from "drizzle-orm/postgres-js"
import { migrate } from "drizzle-orm/postgres-js/migrator"
import postgres from "postgres"

async function main() {
  const url = process.env.DATABASE_URL ?? "postgres://beckon:beckon@localhost:5432/beckon"
  const sql = postgres(url, { max: 1 })
  const db = drizzle(sql)

  // pgvector must exist before the chunk embedding index is created.
  await sql`CREATE EXTENSION IF NOT EXISTS vector`

  const migrationsFolder = fileURLToPath(new URL("../drizzle", import.meta.url))
  await migrate(db, { migrationsFolder })

  await sql.end()
  console.log("Migrations applied.")
}

main().catch((error) => {
  console.error("Migration failed:", error)
  process.exit(1)
})
