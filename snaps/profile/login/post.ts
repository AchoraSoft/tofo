// routes/login/post.ts
export default async (req: Request) => {
  // In real app, validate credentials against database
  const formData = await req.formData();
  const username = formData.get("username");
  const password = formData.get("password");

  // Simplified check - in real app use proper auth
  if (username === "admin" && password === "password") {
    // Return response with Set-Cookie header or token
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/posts/123",
        "Set-Cookie": "token=valid-token; Path=/; HttpOnly",
      },
    });
  }

  return Response.redirect(new URL("/?error=1", req.url).href, 302);
};
