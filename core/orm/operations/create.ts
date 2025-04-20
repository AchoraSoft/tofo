import { Client } from "@/core/orm/Client.ts";
import { buildInsertQuery } from "@/core/orm/utils.ts";

export async function create<T>(
  client: Client,
  table: string,
  data: Record<string, any>
): Promise<T> {
  const { sql, params } = buildInsertQuery(table, data);
  const result = await client.query(`${sql} RETURNING *`, params);
  return result[0];
}
