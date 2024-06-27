# Wendy | The Telegram Chatbot

---

## Development:

---

### Dependencies

- Docker & docker-compose
- nodejs & npm

To install the project dependencies run:
```bash
make install
# runs: npm install
```


### Database

1. Create an `.env` file in the root of the project and insert the following variables:
   ```shell
   # used by `docker/docker-compose.yaml`
   POSTGRES_USER=user 
   POSTGRES_PASSWORD=pass
   POSTGRES_DB=db_name
   POSTGRES_PORT=5432
   
   # used by Prisma
   DATABASE_URL="postgresql://user:pass@localhost:5432/db_name?schema=public"
   ```

2. To boot up the postgres database in a docker run:
    ```bash
    make compose
   # runs: docker-compose --env-file ./.env -f docker/docker-compose.yaml up
    ```

### Server

To start the server run:
```bash
make run
# runs: npx ts-node ./src/index.ts
```