import { Client } from "@/core/orm/Client.ts";

// Класс для парсинга схемы базы данных
export class SchemaParser {
  constructor(private client: Client) {}

  // Получаем информацию о колонках таблицы
  async getColumns(table: string) {
    const query = `
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = $1;
    `;
    const result = await this.client.query(query, [table]);
    return result.rows;
  }
}
