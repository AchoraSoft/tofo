export type RouteParams = Record<string, string>;
export type NextFunction = () => Promise<Response>;
export type Middleware = (
  req: Request,
  params: RouteParams,
  next: NextFunction
) => Promise<Response>;
export type RouteHandler = (
  req: Request,
  params: RouteParams
) => Promise<Response>;
