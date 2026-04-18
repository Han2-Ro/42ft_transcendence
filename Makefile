run:
	docker compose -f docker-compose.yml up -d

dev:
	docker compose up

dev-build:
	docker compose up --build

down:
	docker compose down

reset:
	docker compose down -v

build:
	docker compose build

logs:
	docker compose logs -f

migrate:
	docker compose exec nextjs pnpm prisma migrate dev --name $(name)
