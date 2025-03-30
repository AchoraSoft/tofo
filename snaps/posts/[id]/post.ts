import { returnJson } from "@/core/Controller.ts";

export default async (req: Request, params: Record<string, string>) => {
  const id = params.id || "123";
  const body = await req.json();
  console.log(`Received POST for ID: ${id}`, body);

  return returnJson({
    success: true,
    id,
    message: "Post updated successfully",
    data: body,
  });
};
