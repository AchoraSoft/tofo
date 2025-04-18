import { Model } from "@/core/orm/Models.ts"; // Импортируем базовую модель
import { Client } from "@/core/orm/Client.ts";

export class Card extends Model {
  static override table = "cards"; // Имя таблицы
  static override fields = {
    id: "INTEGER",
    token: "TEXT",
    created_at: "TIMESTAMP",
    secret_token: "TEXT",
  };

  static override async sync(client: Client): Promise<void> {
    await super.sync(client);
  }
}
