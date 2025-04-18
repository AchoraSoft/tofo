export type QueryMode = "array" | "object";

export interface DBClient {
  connect(): Promise<void>;
  query(query: string, params?: any[], mode?: QueryMode): Promise<any>;
  end(): Promise<void>;
}
