import { Client } from "@/core/orm/Client.ts";
import { buildWhereClause } from "@/core/orm/utils.ts";

export async function count(
  client: Client,
  table: string,
  where: Record<string, any> = {}
): Promise<number> {
  const { clause, params } = buildWhereClause(where);
  const sql = `SELECT COUNT(*) as count FROM ${table} ${
    clause ? `WHERE ${clause}` : ""
  };`;
  const result = await client.query(sql, params);
  return parseInt(result[0].count, 10);
}
