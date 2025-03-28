import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { findDynamicDirectories } from "../../server.ts";
import { join } from "https://deno.land/std/path/mod.ts";

Deno.test("findDynamicDirectories should find dynamic directories", async () => {
  const testDir = join(Deno.cwd(), "tests", "fixtures", "test_routes");
  const result = await findDynamicDirectories(join(testDir, "posts"));
  
  assertEquals(result.length, 1);
  assertEquals(result[0].endsWith("posts/[id]"), true);
});

Deno.test("findDynamicDirectories should return empty array for non-existent dir", async () => {
  const result = await findDynamicDirectories("/non/existent/path");
  assertEquals(result.length, 0);
});