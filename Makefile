.PHONY: run down install all

run:
	sudo docker compose up --build -d

down:
	sudo docker compose down --volumes && \
	sudo docker container prune --force && \
	sudo docker image prune --all --force && \
	sudo docker builder prune --all --force && \
	rm -rf dist/ package-lock.json node_modules

install:
	npm install && \
	npm run build

all: down install run