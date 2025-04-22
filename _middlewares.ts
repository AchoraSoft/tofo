import { use, routeUse } from "@/core/Router.ts";
import { Middleware } from "@/core/types.ts";

// Example middlewares
const logger: Middleware = async (req, params, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  const start = Date.now();
  const res = await next();
  console.log(`Completed in ${Date.now() - start}ms`);
  return res;
};

// routes/_middlewares.ts
const auth: Middleware = async (req, params, next) => {
  // Check for token in THREE possible locations:
  const headerToken = req.headers.get("Authorization")?.replace("Bearer ", "");
  const cookieToken = req.headers
    .get("Cookie")
    ?.split("token=")[1]
    ?.split(";")[0];
  const urlToken = new URL(req.url).searchParams.get("token");

  const token = headerToken || cookieToken || urlToken;

  if (!token) {
    return new Response(null, {
      status: 302,
      headers: { Location: "/profile/login" },
    });
  }

  // Verify token (in real app: validate JWT, check DB, etc.)
  if (token !== "valid-token") {
    return new Response(null, {
      status: 302,
      headers: { Location: "/profile/login" },
    });
  }

  // Add user to request context
  (req as any).user = {
    id: "123",
    name: "Authenticated User",
    token, // Optional: pass token to handlers
  };

  return next();
};
// routes/_middlewares.ts
const cors: Middleware = async (req, params, next) => {
  // Handle OPTIONS requests (preflight)
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400", // 24 hours
      },
    });
  }

  // For non-OPTIONS requests, get the response first
  const res = await next();

  // Create new headers from the original response
  const headers = new Headers(res.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Expose-Headers", "*");

  // Return a new response with the modified headers
  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers,
  });
};

// Register middlewares
use(cors);
use(logger);
// Route-specific middlewares
// routeUse("/posts/:id", auth);
