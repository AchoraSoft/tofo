import { returnView } from "@/core/Controller.ts";

export default async (req: Request) => {
  return returnView(
    "login",
    import.meta.url,
    {
      title: "Welcome",
      message: "Please log in to view posts",
    }
    // { useLayout: false } in case if we need form alone as html
  );
};
