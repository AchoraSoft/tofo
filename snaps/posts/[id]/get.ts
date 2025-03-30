import { returnView } from "@/core/Controller.ts";

export default async (req: Request, params: Record<string, string>) => {
  return returnView("show", import.meta.url, {
    title: "Post Details " + (params.id || "123"),
    post: {
      id: params.id || "123",
      title: "Test Post",
      content: "This is post content",
    },
  });
};
