import { Client } from "@/core/orm/Client.ts";
import { buildUpdateQuery } from "@/core/orm/utils.ts";

export async function update(
  client: Client,
  table: string,
  where: Record<string, any>,
  data: Record<string, any>
): Promise<void> {
  const { sql, params } = buildUpdateQuery(table, where, data);
  await client.query(sql, params);
}
