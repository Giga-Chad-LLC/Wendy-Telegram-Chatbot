.PHONY: compose
compose:
	docker-compose --env-file ./.env -f docker/docker-compose.yaml up