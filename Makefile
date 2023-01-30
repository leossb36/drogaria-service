dev-run:
	docker compose up api-dev

dev-build:
	docker compose up --build api-dev

debug-build:
	docker compose up --build api-debug

debug-run:
	docker compose up api-debug

down:
	docker compose down -v