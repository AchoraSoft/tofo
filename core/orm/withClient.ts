import { Client } from "@/core/orm/Client.ts";
import { createModel } from "@/core/orm/Model.ts";

export function withClient<
  S extends Record<string, { table: string; type: any }>
>(
  client: Client,
  schema: S
): {
  [K in keyof S]: ReturnType<typeof createModel<S[K]["type"]>>;
} {
  const models = {} as any;

  for (const key in schema) {
    const { table } = schema[key];
    models[key] = createModel(table, client);
  }

  return models;
}
