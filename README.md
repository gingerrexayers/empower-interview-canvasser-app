Install Global Tools:

pnpm

```
npm install -g pnpm
```

NestJS CLI

```
npm install -g @nestjs/cli
```

TypeORM CLI

```
npm install -g typeorm
```

Docker
[Docker Desktop](https://www.docker.com/products/docker-desktop/)

To run the app:

1. Start the services:

   ```
   ./start.sh
   ```

2. Run migrations:
   Currently requires setting the database host to localhost in the /packages/server/src/data-source.ts file while the database is running in a docker container, then running:
   ```
   pnpm run migration:run
   ```

To build production images:

```
docker-compose -f docker-compose.yaml build
```

To run production images:

```
docker-compose -f docker-compose.yaml up
```

AI tools used:

- Windsurf Cascade (Gemini 2.5 Pro)
- Google AI Studio (Gemini 2.5 Pro Preview)
