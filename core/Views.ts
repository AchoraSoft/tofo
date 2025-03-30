import { renderFile } from "https://deno.land/x/eta@v2.2.0/mod.ts";
import {
  join,
  dirname,
  fromFileUrl,
  resolve,
} from "https://deno.land/std/path/mod.ts";
import { config } from "https://deno.land/x/dotenv/mod.ts";

const { BASE_PATH = "./routes" } = config();

export async function render(
  templateName: string,
  data: Record<string, unknown> = {},
  callerUrl: string
): Promise<Response> {
  try {
    const basePath = resolve(Deno.cwd(), BASE_PATH);
    const callerPath = fromFileUrl(callerUrl);
    const viewsDir = join(dirname(callerPath), "views");
    const templatePath = join(viewsDir, `${templateName}.eta`);

    const content = await renderFile(templatePath, data, {
      views: viewsDir,
      cache: true,
    });

    const layoutPath = join(basePath, "layout.eta");
    try {
      await Deno.stat(layoutPath);
      const fullHtml = await renderFile(
        layoutPath,
        {
          ...data,
          content,
        },
        {
          views: basePath,
        }
      );

      return new Response(fullHtml, {
        headers: { "Content-Type": "text/html" },
      });
    } catch (layoutError) {
      console.log("Global layout not found, rendering without it");
      return new Response(content, {
        headers: { "Content-Type": "text/html" },
      });
    }
  } catch (error) {
    console.error("Render error:", error);
    return new Response("Template error", { status: 500 });
  }
}
