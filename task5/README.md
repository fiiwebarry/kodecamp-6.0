# Task 5 - Products API

NestJS API backed by PostgreSQL.

## Environment

Set these values before running the app:

- `PORT` - server port, defaults to `3000`
- `DB_HOST` - PostgreSQL host, defaults to `localhost`
- `DB_PORT` - PostgreSQL port, defaults to `5432`
- `DB_USERNAME` - PostgreSQL username, defaults to `postgres`
- `DB_PASSWORD` - PostgreSQL password, defaults to `postgres`
- `DB_NAME` - PostgreSQL database name, defaults to `products_db`

## Endpoints

- `GET /products?page=1&limit=10`
- `GET /products/:product_id`
- `POST /products`
- `PUT /products/:product_id`
- `DELETE /products/:product_id`

## Product shape

- `id`: integer
- `name`: string
- `description`: string
- `cost`: float
- `picture`: string[]
- `createdAt`: date
- `updatedAt`: date
