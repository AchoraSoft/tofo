import { Client } from "@/core/orm/Client.ts";
import { SchemaParser } from "@/core/orm/SchemaParser.ts";

export class Model {
  static table: string;
  static fields: Record<string, string> = {};

  constructor(private client: Client) {}

  static async sync(client: Client): Promise<void> {
    const schemaParser = new SchemaParser(client);
    const columns = await schemaParser.getColumns(this.table);
    this.fields = columns.reduce((acc: Record<string, string>, column: any) => {
      acc[column[0]] = column[1];
      return acc;
    }, {});
  }

  static async getAll(client: Client): Promise<any[]> {
    const query = `SELECT * FROM ${this.table};`;
    const result = await client.query(query);
    return result;
  }

  static async create(
    client: Client,
    data: Record<string, any>
  ): Promise<void> {
    const columns = Object.keys(data).join(", ");
    const values = Object.values(data)
      .map((val) => `'${val}'`)
      .join(", ");
    const query = `INSERT INTO ${this.table} (${columns}) VALUES (${values});`;
    await client.query(query);
  }

  static async findById(client: Client, id: number): Promise<any> {
    const query = `SELECT * FROM ${this.table} WHERE id = $1;`;
    const result = await client.query(query, [id]);
    return result.rows[0];
  }
}
