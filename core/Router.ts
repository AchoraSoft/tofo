import {
  join,
  resolve,
  toFileUrl,
} from "https://deno.land/std@0.224.0/path/mod.ts";
import { config } from "https://deno.land/x/dotenv/mod.ts";
import { Middleware, RouteHandler, RouteParams } from "./types.ts";

const { BASE_PATH = "./routes", HOME_PATH = "home" } = config();

// Middleware storage
const globalMiddlewares: Middleware[] = [];
const routeMiddlewarePatterns = new Map<RegExp, Middleware[]>();

// Middleware registration
export function use(middleware: Middleware): void {
  globalMiddlewares.push(middleware);
}

export function routeUse(pathPattern: string, middleware: Middleware): void {
  // Convert path pattern to regex (/:id -> /([^/]+))
  const patternStr = pathPattern.replace(/\/:(\w+)/g, "/([^/]+)");
  const pattern = new RegExp(`^${patternStr}$`);

  const existing = routeMiddlewarePatterns.get(pattern) || [];
  routeMiddlewarePatterns.set(pattern, [...existing, middleware]);
}

function getMiddlewaresForPath(path: string): Middleware[] {
  const middlewares: Middleware[] = [];

  for (const [pattern, mws] of routeMiddlewarePatterns) {
    if (pattern.test(path)) {
      middlewares.push(...mws);
    }
  }

  return middlewares;
}
// Helper functions
async function findDynamicDirectories(path: string): Promise<string[]> {
  const dynamicDirs: string[] = [];
  try {
    for await (const dirEntry of Deno.readDir(path)) {
      if (
        dirEntry.isDirectory &&
        dirEntry.name.startsWith("[") &&
        dirEntry.name.endsWith("]")
      ) {
        dynamicDirs.push(join(path, dirEntry.name));
      }
    }
  } catch (err) {
    console.error(`Error reading directory ${path}:`, err);
  }
  return dynamicDirs;
}

function extractParamName(path: string): string {
  const matches = path.match(/\[([^\]]+)\]/);
  return matches ? matches[1] : "id";
}

async function findRouteHandler(
  pathParts: string[],
  method: string
): Promise<{
  handlerPath: string;
  params: RouteParams;
  matchedPath: string;
} | null> {
  let currentPath = resolve(BASE_PATH);
  const params: RouteParams = {};
  const matchedParts: string[] = [];

  for (const segment of pathParts) {
    const possiblePaths = [
      join(currentPath, segment),
      ...(await findDynamicDirectories(currentPath)),
    ];

    let found = false;
    for (const path of possiblePaths) {
      try {
        await Deno.stat(path);
        currentPath = path;
        matchedParts.push(segment);

        if (path.includes("[") && path.includes("]")) {
          const paramName = extractParamName(path);
          params[paramName] = segment;
        }

        found = true;
        break;
      } catch {
        continue;
      }
    }

    if (!found) return null;
  }

  const handlerPath = join(currentPath, `${method}.ts`);
  try {
    await Deno.stat(handlerPath);
    return {
      handlerPath,
      params,
      matchedPath: `/${matchedParts.join("/")}`,
    };
  } catch {
    return null;
  }
}

async function runMiddlewares(
  req: Request,
  params: RouteParams,
  middlewares: Middleware[],
  handler: RouteHandler
): Promise<Response> {
  let index = -1;

  const dispatch = async (i: number): Promise<Response> => {
    if (i <= index) throw new Error("next() called multiple times");
    index = i;

    if (i >= middlewares.length) {
      // All middlewares passed, call the handler
      return handler(req, params);
    }

    const middleware = middlewares[i];
    const response = await middleware(req, params, () => dispatch(i + 1));

    // Ensure we don't try to modify immutable responses
    return response instanceof Response ? response : new Response(response);
  };

  return dispatch(0);
}

async function safeImport(path: string) {
  try {
    const absolutePath = resolve(Deno.cwd(), path);
    await Deno.stat(absolutePath);
    const fileUrl = toFileUrl(absolutePath);
    return await import(fileUrl.href);
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return null;
    }
    console.error(`Import failed for ${path}:`, error);
    return null;
  }
}

// Initialize middleware loading
const middlewareInit = (async () => {
  try {
    // Try project root first
    let middlewaresPath = join(Deno.cwd(), "_middlewares.ts");
    let result = await safeImport(middlewaresPath);

    // Fallback to BASE_PATH if not found in root
    if (result === null) {
      middlewaresPath = join(BASE_PATH, "_middlewares.ts");
      result = await safeImport(middlewaresPath);
    }

    if (result) {
      console.log("Global middlewares loaded from:", middlewaresPath);
    }
  } catch (error) {
    console.error("Middleware initialization error:", error);
  }
})();

// Main handler
export async function handler(req: Request): Promise<Response> {
  await middlewareInit;

  const url = new URL(req.url);
  const method = req.method.toLowerCase();
  const pathName = url.pathname !== "/" ? url.pathname : `/${HOME_PATH}`;
  const pathParts = pathName.split("/").filter(Boolean);

  try {
    const route = await findRouteHandler(pathParts, method);

    if (!route) {
      return new Response("Not Found", { status: 404 });
    }

    const { handlerPath, params, matchedPath } = route;
    const file = await safeImport(handlerPath);

    if (file?.default && typeof file.default === "function") {
      const specificMiddlewares = getMiddlewaresForPath(matchedPath);
      const allMiddlewares = [...globalMiddlewares, ...specificMiddlewares];

      return allMiddlewares.length > 0
        ? runMiddlewares(req, params, allMiddlewares, file.default)
        : file.default(req, params);
    }

    return new Response("Method Not Allowed", { status: 405 });
  } catch (e) {
    console.error(`Error handling request ${pathName}:`, e);
    return new Response("Internal Server Error", { status: 500 });
  }
}
