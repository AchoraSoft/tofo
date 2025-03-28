export default async (req: Request, params: Record<string, string>) => {
  const id = params.id;
  console.log(`Fetching post with ID: ${id}`);
  
  return new Response(`Post with ID: ${id}`, { 
    status: 200,
    headers: {
      "Content-Type": "text/plain"
    }
  });
};