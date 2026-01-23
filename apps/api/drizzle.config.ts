import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// Memastikan dotenv membaca file .env di folder api
dotenv.config({ path: "./.env" });

export default defineConfig({
    // Trik: Arahkan langsung ke folder, bukan ke file index.ts
    schema: [
        "./src/db/schema/auth.ts",
        "./src/db/schema/categories.ts",
        "./src/db/schema/transactions.ts",
        "./src/db/schema/donation-targets.ts",
        "./src/db/schema/feedbacks.ts",
        "./src/db/schema/site-settings.ts",
    ],
    out: "./src/db/migrations",
    dialect: "postgresql",
    dbCredentials: {
        // Gunakan link PUBLIC dari Railway yang sudah kamu pasang di .env
        url: process.env.DATABASE_URL!,
    },
    // Tambahkan ini agar Drizzle tidak rewel soal format import
    verbose: true,
    strict: true,
});