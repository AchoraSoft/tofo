export default async (req: Request, params: Record<string, string>) => {
    const id = params.id;
    
    try {
      // Получаем тело запроса
      const body = await req.json();
      console.log(`Received POST for ID: ${id}`, body);
      
      // Здесь можно добавить логику обработки данных
      // Например, сохранение в базу данных
      
      return new Response(JSON.stringify({
        success: true,
        id,
        data: body,
        message: "Post updated successfully"
      }), { 
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      });
    } catch (error) {
      console.error("Error processing POST request:", error);
      return new Response(JSON.stringify({
        success: false,
        error: "Invalid request body"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
  };