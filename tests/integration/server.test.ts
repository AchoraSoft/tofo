import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { startServer } from "../../server.ts";

Deno.test("Server integration tests", async (t) => {
  // Запускаем тестовый сервер
  const { server, stop } = await startServer(8001);
  console.log("Test server started on port 8001");

  // Делаем sure сервер запустился
  await new Promise(resolve => setTimeout(resolve, 100));

  try {
    await t.step("GET / should return home", async () => {
      const response = await fetch("http://localhost:8001/");
      assertEquals(response.status, 200);
    });

    await t.step("GET /posts/123 should return post", async () => {
      const response = await fetch("http://localhost:8001/posts/123");
      assertEquals(response.status, 200);
      assertEquals(await response.text(), "Post with ID: 123");
    });

    await t.step("POST /posts/123 should handle data", async () => {
      const response = await fetch("http://localhost:8001/posts/123", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Test" })
      });
      assertEquals(response.status, 200);
      const data = await response.json();
      assertEquals(data.id, "123");
    });
  } finally {
    // Останавливаем сервер после тестов
    stop();
    console.log("Test server stopped");
  }
});