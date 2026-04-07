import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  earlyAccess: true,
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: 'ts-node prisma/seed.ts',
  },
  datasource: {
    url: process.env["DATABASE_URL"]!,
  },
});
