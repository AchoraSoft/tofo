import { Client as PostgresClient } from "https://deno.land/x/postgres@v0.19.3/mod.ts";
import { DBClient, QueryMode } from "@/core/orm/Types.ts";

export class PostgresStrategy implements DBClient {
  private connection: PostgresClient | null = null;

  constructor(
    private config: {
      user: string;
      password: string;
      database: string;
      hostname: string;
      port: number;
      tls?: boolean;
    }
  ) {}

  async connect() {
    const options: any = {
      user: this.config.user,
      password: this.config.password,
      database: this.config.database,
      hostname: this.config.hostname,
      port: this.config.port,
    };

    if (this.config.tls) {
      options.tls = true;
    }

    this.connection = new PostgresClient(options);
    await this.connection.connect();
  }

  async query(sql: string, params: any[] = [], mode: QueryMode = "array") {
    if (!this.connection) throw new Error("No connection");

    if (mode === "object") {
      const result = await this.connection.queryObject(sql, ...params);
      return result.rows;
    } else {
      const result = await this.connection.queryArray(sql, ...params);
      return result.rows;
    }
  }

  async end() {
    if (this.connection) await this.connection.end();
  }
}
