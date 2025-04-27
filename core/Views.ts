import { Eta } from "https://deno.land/x/eta@v3.1.0/src/index.ts";
import {
  join,
  dirname,
  fromFileUrl,
  resolve,
  relative,
} from "https://deno.land/std@0.224.0/path/mod.ts";
import { config } from "https://deno.land/x/dotenv@v3.2.2/mod.ts";

const {
  BASE_PATH = "./snaps",
  COMPONENTS_DIR = "components",
  VIEWS_DIR = "views",
} = config();

const eta = new Eta({
  views: resolve(Deno.cwd(), BASE_PATH),
  cache: true,
  autoEscape: false,
  async includeFile(this: Eta, path: string, templateData: object) {
    // Handle component includes
    if (!path.includes("/") && !path.includes("\\")) {
      const componentPath = join(COMPONENTS_DIR, `${path}.eta`);
      try {
        return await this.renderAsync(componentPath, templateData);
      } catch {
        // Fallback to regular includes
      }
    }
    return await this.renderAsync(path, templateData);
  },
} as any);

const localComonent = (folder: string) => {
  return folder;
};

const globalComonent = (folder: string) => {
  return "/" + folder;
};

export async function render(
  templateName: string,
  data: Record<string, unknown> = {},
  callerUrl: string,
  useLayout: boolean = true
): Promise<Response> {
  try {
    const basePath = resolve(Deno.cwd(), BASE_PATH);
    const callerPath = fromFileUrl(callerUrl);
    const callerDir = dirname(callerPath);

    const viewsDir = join(relative(basePath, callerDir), VIEWS_DIR);
    const templatePath = join(viewsDir, `${templateName}.eta`);

    const templateData = {
      ...data,
      localComonent: localComonent(COMPONENTS_DIR),
      globalComonent: globalComonent(COMPONENTS_DIR),
    };

    const content = await eta.renderAsync(templatePath, templateData);
    let fullHtml = content;
    if (useLayout) {
      fullHtml = await eta.renderAsync("layout.eta", {
        ...templateData,
        content,
      });
    }

    return new Response(fullHtml, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (error) {
    console.error("Render error:", error);
    return new Response("Template error", { status: 500 });
  }
}
