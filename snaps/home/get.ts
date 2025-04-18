import { returnJson } from "@/core/Controller.ts";
import { db } from "@/core/orm/Db.ts";
import { Card } from "../../models/Card.ts";

export default async (req: Request, params: Record<string, string>) => {
  const cards = await Card.getAll(db);
  return returnJson(cards);
};
