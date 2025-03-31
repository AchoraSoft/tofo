import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { handler } from "./core/Router.ts";
import { config } from "https://deno.land/x/dotenv/mod.ts";
import { join } from "https://deno.land/std@0.224.0/path/mod.ts";
import { serveFile } from "https://deno.land/std@0.224.0/http/file_server.ts";

const { PORT = "8000", PUBLIC_PATH = "public" } = config();

const ac = new AbortController();

const server = serve(
  async (req: Request) => {
    const url = new URL(req.url);

    console.log("url.pathname", PUBLIC_PATH);
    console.log("url.pathname", url.pathname);

    if (url.pathname.startsWith(`/${PUBLIC_PATH}/`)) {
      const filePath = url.pathname.replace(`/${PUBLIC_PATH}`, "");

      const fullFilePath = join(Deno.cwd(), PUBLIC_PATH, filePath); // Строим абсолютный путь относительно текущей директории

      // Проверяем, существует ли файл
      try {
        const stat = await Deno.stat(fullFilePath); // Проверка существования файла
      } catch (e) {
        console.error("File not found:", e);
        return new Response("Not Found", { status: 404 });
      }

      return serveFile(req, fullFilePath);
    }

    return handler(req);
  },
  {
    port: parseInt(PORT),
    signal: ac.signal,
    onListen: ({ hostname, port }) => {
      console.log(`Server running at http://${hostname}:${port}`);
    },
  }
);

const shutdown = () => {
  console.log("\nShutting down gracefully...");
  ac.abort();
  Deno.exit(0);
};

Deno.addSignalListener("SIGINT", shutdown); // Ctrl+C

// Для Unix-систем
if (Deno.build.os !== "windows") {
  Deno.addSignalListener("SIGTERM", shutdown);
}

// Для Windows
if (Deno.build.os === "windows") {
  Deno.addSignalListener("SIGBREAK", shutdown); // Ctrl+Break
}

if (import.meta.main) {
  try {
    await server;
  } catch (err) {
    if (!(err instanceof Deno.errors.Interrupted)) {
      console.error("Server error:", err);
      Deno.exit(1);
    }
  }
}
