dev-run:
	docker compose up api-dev mongo mysql

dev-build:
	docker compose up --build api-dev mongo mysql

debug-build:
	docker compose up --build api-debug mongo mysql

debug-run:
	docker compose up api-debug mongo mysql

down:
	docker compose down -v