import { returnView } from "@/core/Controller.ts";

export default async (req: Request, params: Record<string, string>) => {
  return returnView("blog", import.meta.url, {
    title: `Post Details`,
    post: {
      title: "My Markdown Post",
    },
  }, { useMD: true, useLayout: true });
};