import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { config } from "https://deno.land/x/dotenv/mod.ts";
import { join, resolve } from "https://deno.land/std/path/mod.ts";

// Загрузка конфигурации
const { BASE_PATH, HOME_PATH = "home" } = config();

if (!BASE_PATH) {
  throw new Error("BASE_PATH is not defined in the .env file.");
}

// Типы для лучшей читаемости
type RouteParams = Record<string, string>;

/**
 * Поиск динамических директорий в указанном пути
 */
async function findDynamicDirectories(path: string): Promise<string[]> {
  const dynamicDirs: string[] = [];
  try {
    for await (const dirEntry of Deno.readDir(path)) {
      if (dirEntry.isDirectory && dirEntry.name.startsWith("[") && dirEntry.name.endsWith("]")) {
        dynamicDirs.push(join(path, dirEntry.name));
      }
    }
  } catch (err) {
    console.error(`Error reading directory ${path}:`, err);
  }
  return dynamicDirs;
}

/**
 * Поиск обработчика маршрута
 */
async function findRouteHandler(
  basePath: string,
  pathParts: string[],
  method: string
): Promise<{ handlerPath: string; params: RouteParams } | null> {
  let currentPath = basePath;
  const params: RouteParams = {};

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
        
        // Извлекаем параметры из динамических путей
        if (path.includes("[") && path.includes("]")) {
          const paramName = path.split("/").pop()?.replace(/[\[\]]/g, "") || "";
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

  // Проверяем существование файла обработчика
  const handlerPath = join(currentPath, `${method}.ts`);
  try {
    await Deno.stat(handlerPath);
    return { handlerPath, params };
  } catch {
    return null;
  }
}

/**
 * Основной обработчик запросов
 */
async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const method = req.method.toLowerCase();
  const pathName = url.pathname !== '/' ? url.pathname : `/${HOME_PATH}`;
  const pathParts = pathName.split("/").filter(Boolean);

  console.log(`[${new Date().toISOString()}] ${method.toUpperCase()} ${pathName}`);

  try {
    const route = await findRouteHandler(BASE_PATH, pathParts, method);
    
    if (!route) {
      return new Response("Not Found", { status: 404 });
    }

    const { handlerPath, params } = route;
    const file = await import(`file://${resolve(handlerPath)}`);

    if (file.default && typeof file.default === "function") {
      return await file.default(req, params);
    }

    return new Response("Method Not Allowed", { status: 405 });
  } catch (e) {
    console.error(`Error handling request ${pathName}:`, e);
    return new Response("Internal Server Error", { 
      status: 500,
      headers: { "Content-Type": "text/plain" }
    });
  }
}

/**
 * Запуск сервера с возможностью остановки
 */
export async function startServer(port: number) {
  const ac = new AbortController();
  const server = serve(handler, { 
    port,
    signal: ac.signal,
    onListen: () => console.log(`Server started on http://localhost:${port}`)
  });
  
  return {
    server,
    stop: () => {
      console.log("Stopping server...");
      ac.abort();
    }
  };
}

// Запуск сервера только если файл выполняется напрямую
if (import.meta.main) {
  const { server, stop } = await startServer(8000);
  
  // Обработка сигналов завершения
  const handleShutdown = () => {
    console.log("\nShutting down gracefully...");
    stop();
    Deno.exit(0);
  };
  
  Deno.addSignalListener("SIGINT", handleShutdown);
  Deno.addSignalListener("SIGTERM", handleShutdown);

  // Просто ожидаем завершения сервера
  try {
    await server;
  } catch (err) {
    if (!(err instanceof Deno.errors.Interrupted)) {
      console.error("Server error:", err);
    }
  }
}