import { DBClient } from "@/core/orm/Types.ts";
import { PostgresStrategy } from "@/core/orm/strategies/Postgres.ts";

type DBType = "postgres" | "mysql";

interface DBConfig {
  user: string;
  password: string;
  database: string;
  hostname: string;
  port: number;
}

export function createStrategy(dbType: DBType, config: DBConfig): DBClient {
  switch (dbType) {
    case "postgres":
      return new PostgresStrategy(config);
    case "mysql":
      throw new Error("MySQL strategy not implemented");
    default:
      throw new Error(`Unsupported DB type: ${dbType}`);
  }
}
