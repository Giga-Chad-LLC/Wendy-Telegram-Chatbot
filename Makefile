.PHONY: compose
compose:
	docker-compose --env-file ./.env -f docker/docker-compose.yaml up


.PHONY: install
install:
	npm install


.PHONY: run
run:
	 npx ts-node ./src/index.ts