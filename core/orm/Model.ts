import { Client } from "@/core/orm/Client.ts";
import { create } from "@/core/orm/operations/create.ts";
import { findMany, findUnique } from "@/core/orm/operations/find.ts";
import { update } from "@/core/orm/operations/update.ts";
import { deleteRecord } from "@/core/orm/operations/delete.ts";
import { count } from "@/core/orm/operations/count.ts";
import { upsert } from "@/core/orm/operations/upsert.ts";

interface ModelMethods<T> {
  findUnique: (where: Record<string, any>) => Promise<T | null>;
  findAll: () => Promise<T[]>;
  create: (data: Record<string, any>) => Promise<void>;
  createMany: (data: Record<string, any>[]) => Promise<T[]>;
  update: (
    where: Record<string, any>,
    data: Record<string, any>
  ) => Promise<void>;
  updateMany: (
    where: Record<string, any>,
    data: Record<string, any>
  ) => Promise<void>;
  delete: (where: Record<string, any>) => Promise<void>;
  deleteMany: (where: Record<string, any>) => Promise<void>;
  count: (where?: Record<string, any>) => Promise<number>;
  upsert: (
    where: Record<string, any>,
    createData: Record<string, any>,
    updateData: Record<string, any>
  ) => Promise<void>;
}

export function createModel<T>(table: string, client: Client): ModelMethods<T> {
  return {
    findAll: () => findMany(client, table),

    findUnique: (where: Record<string, any>) =>
      findUnique(client, table, where),

    create: (data: Record<string, any>) => create(client, table, data),

    createMany: (data: Record<string, any>[]) => {
      return Promise.all(
        data.map((record) => create<T>(client, table, record))
      );
    },

    update: (where: Record<string, any>, data: Record<string, any>) =>
      update(client, table, where, data),

    updateMany: (where: Record<string, any>, data: Record<string, any>) =>
      update(client, table, where, data), // Поведение аналогично

    delete: (where: Record<string, any>) => deleteRecord(client, table, where),

    deleteMany: (where: Record<string, any>) =>
      deleteRecord(client, table, where), // Поведение аналогично

    count: (where: Record<string, any> = {}) => count(client, table, where),

    upsert: (
      where: Record<string, any>,
      createData: Record<string, any>,
      updateData: Record<string, any>
    ) => upsert(client, table, where, createData, updateData),
  };
}
