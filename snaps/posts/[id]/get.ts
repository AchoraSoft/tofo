import { render } from "../../../core/Views.ts";

export default async (req: Request, params: Record<string, string>) => {
  return render(
    "show",
    {
      id: params.id,
      title: "My First Post",
      content: "This is content from the controller",
    },
    import.meta.url
  );
};
