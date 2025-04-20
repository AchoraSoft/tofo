export type QueryMode = "array" | "object";

export interface DBClient {
  connect(): Promise<void>;
  query(query: string, params?: any[], mode?: QueryMode): Promise<any>;
  end(): Promise<void>;
}

export interface FindOptions {
  where?: Record<string, any>;
}

export interface UpdateOptions {
  where: Record<string, any>;
  data: Record<string, any>;
}

export interface DeleteOptions {
  where: Record<string, any>;
}

export interface UpsertOptions {
  where: Record<string, any>;
  create: Record<string, any>;
  update: Record<string, any>;
}
