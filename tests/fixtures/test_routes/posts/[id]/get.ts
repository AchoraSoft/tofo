export default async (_req: Request, params: Record<string, string>) => {
    return new Response(`Post with ID: ${params.id}`);
  };