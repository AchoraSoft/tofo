export default async function handler(req: Request): Promise<Response> {
  return new Response(`Home page`, { 
    status: 200,
    headers: {
      "Content-Type": "text/plain"
    }
  });
}
