GREEN = \033[0;32m
RESET = \033[0m
COMPOSE_LOCAL = docker compose -f docker-compose.yml -f docker-compose.traefik.yml
LOCAL_IP = $(shell ip route get 1.1.1.1 | grep -oP 'src \K\S+')

run:
	$(COMPOSE_LOCAL) up --build -d
	@echo -n "\n\n\n$(GREEN)You can remotely access to this web app from same network with $(RESET)https://$(LOCAL_IP)\n\n"

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

test-all:
	docker run -it --rm \
	--add-host=host.docker.internal:host-gateway \
	--ipc=host -v $(PWD):/work/ -w /work/tests/ \
	mcr.microsoft.com/playwright:v1.58.2-noble \
	/bin/bash -c "BASE_URL='https://host.docker.internal' npx playwright test"
