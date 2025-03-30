import { returnJson } from "@/core/Controller.ts";

export default async (req: Request, params: Record<string, string>) => {
  return returnJson({
    id: params.id || "123",
    title: "Test Post",
    content: "This is a test post.",
  });
};
