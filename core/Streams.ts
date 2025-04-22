export function streamWithInterval(
  intervalTime: number,
  logic: () => Record<string, any>
): { stream: ReadableStream<Uint8Array>; stop: () => void } {
  const encoder = new TextEncoder();
  const abortController = new AbortController();
  let timer: number | null = null;

  const stream = new ReadableStream({
    start(controller) {
      timer = setInterval(() => {
        if (abortController.signal.aborted) {
          clearInterval(timer!);
          controller.close();
          return;
        }

        try {
          const data = logic();
          const chunk = `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(chunk));
        } catch (error) {
          console.error("Error in stream logic:", error);
        }
      }, intervalTime);
    },
    cancel() {
      clearInterval(timer!);
    },
  });

  return {
    stream,
    stop: () => abortController.abort(), // Остановка потока
  };
}

export function streamWithoutInterval(
  logic: () => Record<string, any>
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream({
    start(controller) {
      try {
        const data = logic();
        const chunk = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(chunk));
        controller.close();
      } catch (error) {
        console.error("Error in stream logic:", error);
        controller.close();
      }
    },
  });
}
