.PHONY: dev api logs

dev:
	docker-compose up -d
	cd apps/web && pnpm dev

api:
	docker-compose up api

logs:
	docker-compose logs -f api
