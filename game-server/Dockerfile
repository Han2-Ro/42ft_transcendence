FROM node:20-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN corepack enable pnpm && pnpm install --prod=false
# RUN ls -l /app/node_modules/typescript/bin/ && (exit 1)
COPY . .
RUN pnpm build
RUN pnpm prune --prod
EXPOSE 4000
CMD ["pnpm", "start"]