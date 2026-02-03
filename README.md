
# INSA Intern Management System

Full-stack intern management platform built with **NestJS** (API) and **Next.js** (Web) in a Turborepo monorepo.

---

## Quick Start

### Prerequisites

- Node.js 24.12.0+
- npm 11.6.2+
- Docker & Docker Compose

### Installation

```sh
git clone https://github.com/nkav2447/insa_intern_mgmt_system.git
cd insa_intern_mgmt_system

npm install
```

### Start Services

```sh
# Start PostgreSQL, Redis, MailDev
cd apps/.docker-node-api
docker-compose up -d
cd ../..
```

### Environment Setup

Copy example files:

```sh
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

> **Note:** Ensure both `.env` files exist and are properly configured. Update `FRONTEND_URL` in `apps/api/.env` if frontend runs on a different port.

Default configuration in `.env`:
- **API Port:** `5005`
- **Web Port:** `3000`
- **PostgreSQL Port:** `54321` (Docker)
- **Redis Port:** `6379`
- **MailDev Port:** `1080` (for viewing test emails)

---

### Database Setup

Run migrations and seed the database:

```sh
cd apps/api

# Run database migrations
npm run migrations:up

# Seed the database with initial data
npm run seed
```


### Sample Login Credentials

After seeding the database:

```
Admin Account:
Email: admin@insa.gov.et
Password: Admin@123
```

University coordinators are created automatically during seeding.

---

## Email Configuration

The system uses **MailDev** for local email testing (no real emails sent in dev).

**MailDev Web Interface:** http://localhost:1080

Email events:
- User account creation (with temporary password)
- Password reset requests
- Application notifications
- Student acceptance/rejection notices
