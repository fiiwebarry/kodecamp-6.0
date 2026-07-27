# Task 6 — Auth, roles and product ownership

E-commerce API built with NestJS, TypeORM and PostgreSQL. Adds authentication,
an admin role, password reset, and ties every product to the admin that created
it.

## Setup

```bash
pnpm install
```

Create a `.env` file:

```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=ecommerce

JWT_SECRET=mysecret
JWT_EXPIRES=1d
```

Then run it:

```bash
pnpm run start:dev     # watch mode
pnpm run start:prod    # production
pnpm run test          # unit tests
pnpm run lint          # eslint
```

## Routes

### Users

| Method | Path               | Auth   | Body                    |
| ------ | ------------------ | ------ | ----------------------- |
| POST   | `/register`        | public | `fullname, email, password` |
| POST   | `/login`           | public | `email, password`       |
| POST   | `/forget-password` | public | `email`                 |
| POST   | `/reset-password`  | public | `token, password`       |

### Admins

| Method | Path              | Auth   | Body                        |
| ------ | ----------------- | ------ | --------------------------- |
| POST   | `/admin/register` | public | `fullname, email, password` |
| POST   | `/admin/login`    | public | `email, password`           |

`/admin/login` only issues a token to an account whose role is `ADMIN`. A normal
user with correct credentials is rejected.

### Products

| Method | Path                   | Auth              |
| ------ | ---------------------- | ----------------- |
| GET    | `/products`            | public            |
| GET    | `/products/:product_id`| public            |
| POST   | `/products`            | logged-in + ADMIN |
| PUT    | `/products/:product_id`| logged-in + ADMIN |
| DELETE | `/products/:product_id`| logged-in + ADMIN |

`GET /products` supports `?page=` and `?limit=`.

Send the token from login as `Authorization: Bearer <access_token>`.

## Auth and role decorators

- `JwtAuthGuard` (`src/auth/guards/jwt-auth.guard.ts`) — validates the bearer
  token and attaches the user to the request.
- `@Roles(...)` (`src/auth/decorators/roles.decorator.ts`) — marks a handler
  with the roles allowed to reach it.
- `RolesGuard` (`src/auth/guards/roles.guard.ts`) — reads that metadata.
  401 when nobody is logged in, 403 when the role does not match.
- `@CurrentUser()` (`src/auth/decorators/current-user.decorator.ts`) — reads the
  logged-in user (or one field of it) off the request.

The write routes combine them:

```ts
@Post()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
create(@Body() dto: CreateProductDto, @CurrentUser('id') adminId: number) {
  return this.productsService.create(dto, adminId);
}
```

Guard order matters — `JwtAuthGuard` has to run first so `RolesGuard` has a user
to inspect.

## Product ownership

`Product` has an `admin_id` column and a `ManyToOne` relation to `User`, matched
by a `OneToMany` on the user side, so one admin has many products. The id is
taken from the JWT of the admin making the request, never from the request body.

```ts
@ManyToOne(() => User, (user) => user.products, { nullable: false, onDelete: 'CASCADE' })
@JoinColumn({ name: 'admin_id' })
admin: User;

@Column({ name: 'admin_id' })
adminId: number;
```

## Password reset flow

1. `POST /forget-password` with an email. A random token is generated, its
   SHA-256 hash is stored on the user with a 15-minute expiry, and the raw token
   is returned in the response — there is no mail service in this project, so in
   production this would be emailed instead.
2. `POST /reset-password` with that token and a new password. The token is
   hashed, looked up, checked against its expiry, then cleared.

The response to `/forget-password` is identical for known and unknown emails, so
the route cannot be used to find out which addresses are registered.

## Notes

- Passwords are hashed with bcrypt and the `password`, `resetToken` and
  `resetTokenExpiry` columns are `select: false`, so they are never returned by
  an ordinary query.
- Login failures use one message for both "no such user" and "wrong password".
- `synchronize: true` is on for development convenience; use migrations for
  anything real.
