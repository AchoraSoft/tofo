import { renderFile } from "https://deno.land/x/eta@v2.2.0/mod.ts";
import {
  dirname,
  join,
  relative,
  resolve,
  fromFileUrl,
} from "https://deno.land/std/path/mod.ts";

/**
 * Нормализует путь (замена для устаревшей normalize)
 */
function normalizePath(path: string): string {
  return resolve(path);
}

/**
 * Очищает Windows-пути от дублирования
 */
function cleanWindowsPath(path: string): string {
  return path
    .replace(/^([A-Z]:)(.*)/i, (_, drive, rest) => {
      const normalizedRest = rest
        .replace(/\\/g, "/")
        .replace(/^\/+/, "/")
        .replace(/\/+/g, "/");
      return drive + normalizedRest;
    })
    .replace(/^\/*/, "");
}

export async function render(
  templateName: string,
  data: object,
  callerPath: string,
  options?: {
    status?: number;
    headers?: Record<string, string>;
  }
): Promise<Response> {
  try {
    // Конвертируем file:// URL в путь, если нужно
    const physicalCallerPath = callerPath.startsWith("file://")
      ? fromFileUrl(callerPath)
      : callerPath;

    // Нормализуем и очищаем путь
    const normalizedPath = cleanWindowsPath(normalizePath(physicalCallerPath));
    const callerDir = dirname(normalizedPath);

    // Путь к шаблону
    const templatePath = join(callerDir, "views", `${templateName}.eta`);
    const cleanTemplatePath = cleanWindowsPath(templatePath);

    console.log(`[View] Rendering: ${cleanTemplatePath}`);

    const html = await renderFile(cleanTemplatePath, data, {
      views: Deno.cwd(),
      cache: Deno.env.get("DENO_ENV") === "production",
      autoescape: true,
    });

    return new Response(html, {
      status: options?.status || 200,
      headers: {
        "Content-Type": "text/html",
        ...options?.headers,
      },
    });
  } catch (error) {
    console.error(`[View Error] ${templateName}:`, error);
    return new Response("Template Error", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
