FROM node:20-alpine

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml /app/
COPY shared /app/shared
COPY game-server /app/game-server

WORKDIR /app

RUN corepack enable pnpm && pnpm install --prod=false

WORKDIR /app/game-server
RUN pnpm build
RUN CI=true pnpm prune --prod

EXPOSE 4000
CMD ["pnpm", "start"]