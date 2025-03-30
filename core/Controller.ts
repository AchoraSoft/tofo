import { render } from "./Views.ts";

export function returnJson<T>(data: T, status: number = 200): Response {
  try {
    return new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function returnView<T>(
  viewName: string,
  callerUrl: string,
  data: T
): Promise<Response> {
  try {
    return await render(viewName, data, callerUrl);
  } catch (error) {
    return new Response(`Error rendering ${viewName}: ${error.message}`, {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
