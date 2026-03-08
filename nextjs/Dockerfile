FROM node:20-alpine

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml /app/
COPY shared /app/shared
COPY nextjs /app/nextjs

WORKDIR /app/nextjs

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install
RUN pnpm prisma generate
RUN pnpm run build

RUN chmod +x /app/nextjs/entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["/app/nextjs/entrypoint.sh"]