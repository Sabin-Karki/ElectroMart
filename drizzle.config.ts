import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./server/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: 'postgresql://postgres:123@localhost:5432/ecommerce',
  },
  migrations: {
    table: "migrations",
    schema: "public",
  }
});
