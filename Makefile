.PHONY: run down install all

CONTAINER_NAME=drogaria-service-container
IMAGE_NAME=drogaria-service

run:
	@if [ $$(docker ps -q -f name=$(CONTAINER_NAME)) ]; then \
		echo "Container $(CONTAINER_NAME) já está em execução."; \
	else \
		echo "Iniciando o container $(CONTAINER_NAME)..."; \
		docker run -d -p 3000:3000 --name $(CONTAINER_NAME) --env NODE_ENV=development $(IMAGE_NAME); \
	fi

down:
	@echo "Parando e removendo containers, volumes e imagens desnecessários..."
	sudo docker container prune --force && \
	sudo docker image prune --all --force && \
	sudo docker builder prune --all --force && \
	rm -rf dist/ package-lock.json node_modules

install:
	@echo "Instalando dependências e construindo o projeto..."
	npm install
	npm run build
	sudo docker build -t $(IMAGE_NAME) .

all: down install run