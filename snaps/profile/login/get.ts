import { returnJson } from "@/core/Controller.ts";

export default async (req: Request, params: Record<string, string>) => {
  return returnJson({
    id: params.id || "123",
    title: "Test profile",
    content: "This is a test profile.",
  });
};
