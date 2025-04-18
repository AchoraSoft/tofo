import { parseDatabaseUrl } from "./utils.ts";
import { Client } from "@/core/orm/Client.ts";
import { config } from "https://deno.land/x/dotenv@v3.2.2/mod.ts";

const { DATABASE_URL } = config();

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL not set in .env");
}

const dbConfig: DBConfig = parseDatabaseUrl(DATABASE_URL);
const db = new Client("postgres", dbConfig);

await db.connect();

export { db };
