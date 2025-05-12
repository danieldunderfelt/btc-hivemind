# https://elysiajs.com/patterns/deployment.html#docker

FROM oven/bun AS build

WORKDIR /app

# Cache packages installation
COPY package.json package.json
COPY bun.lock bun.lock

RUN bun install --frozen-lockfile

COPY ./server ./server
COPY ./db ./db

ENV NODE_ENV=production

RUN bun build ./server/index.ts \
  --compile \
  --minify-whitespace \
  --minify-syntax \
  --target bun \
  --outfile dist/server.js

FROM gcr.io/distroless/base

WORKDIR /app

COPY --from=build /app/dist/server.js server

ENV NODE_ENV=production

CMD ["./server"]

EXPOSE 3000