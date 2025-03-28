import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { findRouteHandler } from "../../server.ts";
import { join } from "https://deno.land/std/path/mod.ts";

const testBasePath = join(Deno.cwd(), "tests", "fixtures", "test_routes");

Deno.test("findRouteHandler should find dynamic route with params", async () => {
  const result = await findRouteHandler(testBasePath, ["posts", "123"], "get");
  assertEquals(result?.handlerPath.endsWith("posts/[id]/get.ts"), true);
  assertEquals(result?.params, { id: "123" });
});

Deno.test("findRouteHandler should return null for non-existent route", async () => {
  const result = await findRouteHandler(testBasePath, ["non", "existent"], "get");
  assertEquals(result, null);
});