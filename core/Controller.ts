import { render } from "./Views.ts";

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

export async function returnView<T>(
  viewName: string,
  callerUrl: string,
  data: T,
  options: { useLayout?: boolean } = { useLayout: true }
): Promise<Response> {
  try {
    return await render(viewName, data, callerUrl, options.useLayout);
  } catch (error) {
    return new Response(`Error rendering ${viewName}: ${error.message}`, {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
