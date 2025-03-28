import { render } from "../../../core/Views.ts";

export default async (req: Request, params: Record<string, string>) => {
  // Тестовые данные - замените на реальные
  const postData = {
    id: params.id || "123",
    title: "Test Post",
    content: "This is post content",
  };

  return render(
    "show",
    {
      title: "Post Details " + params.id, // Для layout.eta
      post: postData,
    },
    import.meta.url
  );
};
