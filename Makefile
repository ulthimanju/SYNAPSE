.PHONY: help dev build test clean

help:
	@echo "Synapse Monorepo Commands:"
	@echo "  make dev      Start development environment"
	@echo "  make build    Build docker containers"
	@echo "  make test     Run tests across all services"

dev:
	docker compose -f docker-compose.dev.yml up --build

build:
	docker compose -f docker-compose.yml build

test:
	pytest
