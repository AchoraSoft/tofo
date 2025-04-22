<p align="center">
  <img src="https://github.com/AchoraSoft/tofo/blob/master/logo.png?raw=true" alt="Описание изображения" width="300"/>
</p>

# TOFO | Think Once, Flow On 🚀

A lightweight API zen philosofy framework.

## Features

- 🚀 **File-based routing** - Routes map directly to filesystem structure
- 🧩 **Dynamic routes** - `[param]` syntax for path parameters
- ⚡ **Zero config** - Just drop files in the routes directory
- 📦 **Simple views** - ETA under the hood
- 🍸 **Tailwind integration**
- 👻 **Alpine.js** - well, we are in Alps right ? 😺
- 🌐 **Middleware support** - For Auth or any other features like RUM (with Dynatrace)

## Installation

No installation needed! Just use Deno:

```bash
deno run --allow-net --allow-read --allow-env server.ts
```

## Getting Started

1. Create your project structure:

```
project/
├── routes/
    | layout.eta # layout wrapper for all views inside. Can be disconnected via flag useLayout
│   ├── home
      |--views/
      |   home.eta (name can be variable)
│     ├─-get.ts          # Handles GET /
│   ├── posts/
│   │   ├── [id]/
│   │   │   ├── get.ts   # Handles GET /posts/:id
│   │   │   └── post.ts  # Handles POST /posts/:id
├── server.ts
|   _middlewares.ts # middlewares for your needs
└── .env
```

2. Create a `.env` file:

```env
PORT=8000
BASE_PATH=./routes
HOME_PATH=home
ALLOWED_METHODS=GET,POST
VIEWS_BASE=./routes
```

3. Write your route handlers:

```typescript
// routes/posts/[id]/get.ts
export default async (_req: Request, params: Record<string, string>) => {
  const id = params.id;
  return new Response(`Post ${id}`, { status: 200 });
};
```

## Route Handlers

Each route file should export a default async function that accepts:

- `Request` - The incoming request object
- `params` - Route parameters for dynamic routes

Example for POST handler:

```typescript
// routes/posts/[id]/post.ts
export default async (req: Request, params: Record<string, string>) => {
  const data = await req.json();
  return new Response(
    JSON.stringify({
      id: params.id,
      data,
    }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );
};
```

## Development

Start the development server:

```bash
deno run --allow-net --allow-read --allow-env --watch server.ts
```

## Deployment

Deploy to any Deno-compatible hosting:

- Deno Deploy
- Docker
- Kubernetes
- Your own server

Example Dockerfile:

```dockerfile
FROM denoland/deno:latest

WORKDIR /app
COPY . .

CMD ["run", "--allow-net", "--allow-read", "--allow-env", "server.ts"]
```

## Testing

Run tests:

```bash
deno test --allow-net --allow-read --allow-env
```

## Contributing

Pull requests are welcome! Please:

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

MIT

## Benchmarks

Simple benchmark with `wrk`:

```
wrk -t12 -c400 -d30s http://localhost:8000
```

Results:

- 15,000+ requests/sec
- <2ms average latency
- 0% errors

## Roadmap to version 0.1.0

- [x] Basic routing
- [x] Dynamic parameters
- [x] MVC pattern (like ROR)
- [x] Add Tailwind integration
- [x] Add views with Alpine.js
- [x] Static file serving
- [x] Middleware support
- [x] CLI tool for scaffolding (Just install it from here https://github.com/AchoraSoft/tofocli_tool/tree/v1.3.1 and type tofo <your-project-name> in the CLI)
- [x] File generator from yaml file
- [x] TOFO ORM integration. CLI operation is in another thread
- [x] Server Events support for real-time data

## Why TOFO?

- **Keep It Simple, Stupid** philosophy
- No complex configuration
- Filesystem as your route map
- Perfect for microservices and APIs
