import { Client } from "@/core/orm/Client.ts";
import { buildWhereClause } from "@/core/orm/utils.ts";

export async function findUnique(
  client: Client,
  table: string,
  where: Record<string, any>
): Promise<any | null> {
  const { clause, params } = buildWhereClause(where);
  const sql = `SELECT * FROM ${table} WHERE ${clause} LIMIT 1;`;
  const result = await client.query(sql, params);
  return result[0] ?? null;
}

export async function findMany(
  client: Client,
  table: string,
  where: Record<string, any> = {}
): Promise<any[]> {
  const { clause, params } = buildWhereClause(where);
  const sql = `SELECT * FROM ${table} ${clause ? `WHERE ${clause}` : ""};`;
  return await client.query(sql, params);
}
