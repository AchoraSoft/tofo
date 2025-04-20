import { returnJson } from "@/core/Controller.ts";
import { tofo } from "@/models/index.ts";

export default async () => {
  const cards = await tofo.cards.findUnique({ id: 29 });
  return returnJson(cards);
};
