COMPOSE_LOCAL = docker compose -f docker-compose.yml -f docker-compose.traefik.yml

run:
	$(COMPOSE_LOCAL) up --build -d

dev:
	$(COMPOSE_LOCAL) -f docker-compose.override.yml up

dev-build:
	$(COMPOSE_LOCAL) -f docker-compose.override.yml up --build

down:
	$(COMPOSE_LOCAL) down

reset:
	$(COMPOSE_LOCAL) down -v

build:
	$(COMPOSE_LOCAL) build

logs:
	$(COMPOSE_LOCAL) logs -f

migrate:
	$(COMPOSE_LOCAL) exec nextjs pnpm prisma migrate dev --name $(name)

copy-migration:
	$(COMPOSE_LOCAL) cp nextjs:/app/nextjs/prisma/migrations/$(name) ./nextjs/prisma/migrations/
