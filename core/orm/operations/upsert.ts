import { create } from "./create.ts";
import { update } from "./update.ts";
import { findUnique } from "./find.ts";
import { Client } from "@/core/orm/Client.ts";

export async function upsert(
  client: Client,
  table: string,
  where: Record<string, any>,
  createData: Record<string, any>,
  updateData: Record<string, any>
): Promise<void> {
  const existing = await findUnique(client, table, where);
  if (existing) {
    await update(client, table, where, updateData);
  } else {
    await create(client, table, createData);
  }
}
