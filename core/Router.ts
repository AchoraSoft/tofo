import { join, resolve } from "https://deno.land/std@0.224.0/path/mod.ts";
import { config } from "https://deno.land/x/dotenv/mod.ts";

// Загрузка конфигурации
const { BASE_PATH = "./routes", HOME_PATH = "home" } = config();

// Типы
type RouteParams = Record<string, string>;

/**
 * Поиск динамических директорий в указанном пути
 */
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

/**
 * Извлекает имя параметра из пути вида "[param]"
 */
function extractParamName(path: string): string {
  const matches = path.match(/\[([^\]]+)\]/);
  return matches ? matches[1] : "id";
}

/**
 * Поиск обработчика маршрута
 */
async function findRouteHandler(
  pathParts: string[],
  method: string
): Promise<{ handlerPath: string; params: RouteParams } | null> {
  let currentPath = resolve(BASE_PATH);
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

        // Извлекаем параметры только из динамических частей пути
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
export async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const method = req.method.toLowerCase();
  const pathName = url.pathname !== "/" ? url.pathname : `/${HOME_PATH}`;
  const pathParts = pathName.split("/").filter(Boolean);

  console.log(
    `[${new Date().toISOString()}] ${method.toUpperCase()} ${pathName}`
  );

  try {
    const route = await findRouteHandler(pathParts, method);

    if (!route) {
      return new Response("Not Found", { status: 404 });
    }

    const { handlerPath, params } = route;
    const file = await import(`file://${resolve(handlerPath)}`);

    if (file.default && typeof file.default === "function") {
      console.log("Resolved params:", params); // Для отладки
      return await file.default(req, params);
    }

    return new Response("Method Not Allowed", { status: 405 });
  } catch (e) {
    console.error(`Error handling request ${pathName}:`, e);
    return new Response("Internal Server Error", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
