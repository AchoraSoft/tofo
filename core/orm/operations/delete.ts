import { Client } from "@/core/orm/Client.ts";
import { buildWhereClause } from "@/core/orm/utils.ts";

export async function deleteRecord(
  client: Client,
  table: string,
  where: Record<string, any>
): Promise<void> {
  const { clause, params } = buildWhereClause(where);
  const sql = `DELETE FROM ${table} WHERE ${clause} LIMIT 1;`;
  await client.query(sql, params);
}
