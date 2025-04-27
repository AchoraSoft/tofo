import { render } from "./Views.ts"; 
import MarkdownIt from "https://esm.sh/markdown-it@14.0.0?bundle";

const isReadableStream = (value: unknown): value is ReadableStream => {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as ReadableStream).getReader === "function"
  );
};

export function returnJson<T>(
  data: T | ReadableStream<Uint8Array>,
  status: number = 200
): Response {
  const headers = new Headers();
  console.log(isReadableStream(data));
  if (data instanceof ReadableStream) {
    headers.set("Content-Type", "text/event-stream");
    headers.set("Cache-Control", "no-cache");
    headers.set("Connection", "keep-alive");
    return new Response(data, { status, headers });
  }

  headers.set("Content-Type", "application/json");
  try {
    return new Response(JSON.stringify(data), { status, headers });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function returnView<T extends Record<string, any>>(
  viewName: string,
  callerUrl: string,
  data: T,
  options: { useLayout?: boolean; useMD?: boolean } = { useLayout: true }
): Promise<Response> {
  try {
    const currentFilePath = new URL(callerUrl).pathname;
    
    if (options.useMD) {
      const mdPath = currentFilePath.replace(/\/[^/]+$/, `/views/${viewName}.md`);

      try {
        const markdownText = await Deno.readTextFile(mdPath, { encoding: "utf-8" });
       
        const md = new MarkdownIt();
        const htmlContent = md.render(markdownText);

        data = { ...data, content: htmlContent };
      } catch (error) {
        console.error(`Error on parsing stage ${mdPath}:`, error);
        data = { ...data, content: "Cant get content from Markdown." };
      }
    }

    return await render(viewName, data, callerUrl, options.useLayout);
  } catch (error) {
    return new Response(`Template render error ${viewName}: ${error.message}`, {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}