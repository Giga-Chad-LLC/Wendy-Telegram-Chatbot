.PHONY: all
all:
	make install
	make compose
	make run

.PHONY: install
install:
	npm install


.PHONY: compose
compose:
	docker-compose --env-file ./.env -f docker/docker-compose.yaml up


.PHONY: run
run:
	 npx ts-node ./src/index.ts