// routes/posts/[id]/get.ts
import { returnView } from "@/core/Controller.ts";

export default async (req: Request, params: Record<string, string>) => {
  // Access user from request (added by auth middleware)
  // const user = (req as any).user;

  return returnView("show", import.meta.url, {
    title: `Post Details - ${params.id}`,
    // user, // Pass user to template
    post: {
      id: params.id,
      title: "My Protected Post",
      content: "This content is only visible to authenticated users",
      // user,
    },
  });
};
