import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { handler } from "./core/Router.ts";
import { config } from "https://deno.land/x/dotenv/mod.ts";

// Загрузка конфигурации
const { PORT = "8000" } = config();

const ac = new AbortController();

const server = serve(handler, {
  port: parseInt(PORT),
  signal: ac.signal,
  onListen: ({ hostname, port }) => {
    console.log(`Server running at http://${hostname}:${port}`);
  },
});

const shutdown = () => {
  console.log("\nShutting down gracefully...");
  ac.abort();
  Deno.exit(0);
};

// Кроссплатформенная обработка сигналов
Deno.addSignalListener("SIGINT", shutdown); // Ctrl+C

// Только для Unix-систем
if (Deno.build.os !== "windows") {
  Deno.addSignalListener("SIGTERM", shutdown);
}

// Альтернатива для Windows
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
