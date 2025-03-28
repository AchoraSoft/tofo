export default async (req: Request, params: Record<string, string>) => {
    const body = await req.json();
    return new Response(JSON.stringify({ ...body, id: params.id }), {
      headers: { "Content-Type": "application/json" }
    });
  };