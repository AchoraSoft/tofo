import { returnJson } from "@/core/Controller.ts";
import { streamWithInterval, streamWithoutInterval } from "@/core/Streams.ts";
// import { tofo } from "@/models/index.ts";

// export default async () => {
export default () => {
  // const cards = await tofo.cards.findUnique({ id: 29 });
  // return returnJson(cards);
  // Пример с потоком с интервалом:
  const { stream } = streamWithInterval(1000, () => ({
    time: new Date().toISOString(),
  }));

  const simpleStream = streamWithoutInterval(() => ({
    time: new Date().toISOString(),
  }));

  return returnJson(stream);
};
