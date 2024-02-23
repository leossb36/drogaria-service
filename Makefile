dev-run:
	docker compose up api-dev

dev-build:
	docker compose up --build api-dev

debug-build:
	docker compose up --build api-debug

run:
	docker compose up --build api-prod -d

debug-run:
	docker compose up api-debug

down:
	docker compose down -v