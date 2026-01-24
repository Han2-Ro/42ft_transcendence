FROM node:20-alpine

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY . /app
WORKDIR /app

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install
RUN pnpm prisma generate
RUN pnpm run build

EXPOSE 3000
CMD [ "pnpm", "start" ]