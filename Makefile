.PHONY: help dev build test clean

help:
	@echo "Synapse Monorepo Commands:"
	@echo "  make dev      Start Synapse containers (single compose)"
	@echo "  make build    Build docker containers"
	@echo "  make test     Run tests across all services"

dev:
	docker compose up -d --build

build:
	docker compose build

test:
	pytest
