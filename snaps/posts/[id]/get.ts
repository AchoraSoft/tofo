// routes/posts/[id]/get.ts
import { returnView } from "@/core/Controller.ts";

export default async (req: Request, params: Record<string, string>) => {

  return returnView("show", import.meta.url, {
    title: `Post Details - ${params.id}`,
    post: {
      id: params.id,
      title: "My Protected Post",
      content: "This content is only visible to authenticated users",
    },
  });
};
