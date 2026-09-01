# SwiftRider Backend

A NestJS backend for a dispatch rider platform where customers can request deliveries, riders can accept and complete them, and admins can monitor activity and revenue.

## Features

- JWT authentication for customers, riders, and admins
- Role-based access control
- Delivery lifecycle: pending -> accepted -> in-progress -> completed
- Rider location tracking with GPS coordinates
- Simulated payment processing for delivery costs
- Admin analytics for completed deliveries and revenue
- Swagger API docs at /api/docs
- SQLite persistence for local development

## Stack

- Node.js
- NestJS
- TypeORM
- SQLite
- JWT / Passport
- Swagger
- Jest

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment example:

```bash
cp .env.example .env
```

3. Start the development server:

```bash
npm run start:dev
```

The API runs on http://localhost:3000 and the Swagger UI is available at http://localhost:3000/api/docs.

## Environment Variables

```env
PORT=3000
JWT_SECRET=swift-rider-secret
JWT_EXPIRES=1d
DB_NAME=swift_rider.db
```

## API Overview

### Auth

- POST /auth/signup
- POST /auth/login

### Users

- GET /users/me
- GET /users/all (admin only)
- GET /users/:id (admin only)

### Deliveries

- POST /deliveries
- GET /deliveries/available (rider only)
- PATCH /deliveries/:id/accept (rider only)
- PATCH /deliveries/:id/status
- PATCH /deliveries/:id/location (rider only)
- PATCH /deliveries/:id/pay
- GET /deliveries/analytics (admin only)
- GET /deliveries (admin only)

### Payments

- POST /payments
- GET /payments (admin only)
- GET /payments/:id/verify (admin only)

## Database Design

### User

- id: string
- name: string
- email: string
- password: string
- role: customer | rider | admin
- createdAt: date
- updatedAt: date

### Delivery

- id: string
- customerId: string
- riderId: string | null
- pickupLocation: string
- dropoffLocation: string
- packageDetails: string
- cost: number
- status: pending | accepted | in-progress | completed
- riderLatitude: number | null
- riderLongitude: number | null
- paymentCompleted: boolean
- createdAt: date
- updatedAt: date

### Payment

- id: string
- deliveryId: string
- customerId: string
- amount: number
- status: pending | paid
- createdAt: date

## Admin Analytics

The admin analytics endpoint returns:

- totalDeliveries
- completedDeliveries
- revenue

## Testing

```bash
npm test -- --runInBand
```

## Deployment

This backend can be deployed to Render or Railway by setting the environment variables and running:

```bash
npm run start:prod
```

## Notes

This project demonstrates a modular backend architecture with REST APIs, JWT role protection, data persistence, analytics, and mock payment/notification patterns aligned with a real dispatch-rider platform demo.
