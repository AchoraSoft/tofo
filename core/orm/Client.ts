import { createStrategy } from "@/core/orm/strategies/StrategyFactory.ts";
import { DBClient, QueryMode } from "@/core/orm/Types.ts";

export class Client {
  private strategy: DBClient;

  constructor(dbType: DBType, config: DBConfig) {
    this.strategy = createStrategy(dbType, config);
  }

  async connect() {
    await this.strategy.connect();
  }

  async query(sql: string, params: any[] = [], mode: QueryMode = "array") {
    return await this.strategy.query(sql, params, mode);
  }

  async end() {
    await this.strategy.end();
  }
}
