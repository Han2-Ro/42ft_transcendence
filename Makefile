COMPOSE_FILE=./docker-compose.yml
WATCHED_FILES=$(shell find ./ -type f -not -path '*/node_modules/*')

all: up

up: check_changes
	@docker compose -f $(COMPOSE_FILE) up -d --build

down:
	@docker compose -f $(COMPOSE_FILE) down

stop:
	@docker compose -f $(COMPOSE_FILE) stop

start:
	@docker compose -f $(COMPOSE_FILE) start

DockerPermissions:
	sudo chmod 666 /var/run/docker.sock 

re: stop down up start

nuke:
	docker compose -f $(COMPOSE_FILE) down -v;
	docker system prune -fa;

dev:
	sh ./dev_build.sh;

check_changes:
	@if [ ! -f .last_build ] || [ `find $(WATCHED_FILES) -newer .last_build | wc -l` -gt 0 ]; then \
		echo "Changes detected! Removing volumes and resetting databases..."; \
		make nuke; \
		touch .last_build; \
	else \
		echo "No changes detected."; \
	fi
