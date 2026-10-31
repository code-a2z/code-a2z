# Code A2Z - NestJS Backend

This directory contains the new NestJS + TypeScript backend for Code A2Z.

This is the initial backend setup. The existing Express backend
remains unchanged.

## Prerequisites

- Node.js (v24.15+ recommended)
- npm
- MongoDB (running locally or through Docker)

## Installation

From the repository root:

```bash
cd server-nestjs
npm install
```

## Database Setup

1. Make sure MongoDB is running on port 27017.
2. Create your local environment file:

   cp .env.example .env

3. Update MONGODB_URL in .env if needed.
4. Start the backend using npm run start:dev.

The NestJS backend uses the official MongoDB Node.js driver for five document
types:

- User
- Subscriber
- Organization
- Organization Member
- Set Password Token

Native repositories create the same collections and indexes as the existing
Express backend. Repository writes are validated at runtime and apply the same
normalization, defaults, and timestamp field names as the Express Mongoose
schemas. Validation remains in the NestJS application rather than at the
MongoDB collection level so existing Express records remain compatible.

## Development

```bash
npm run start:dev
```

The server runs at http://localhost:3000 by default.

## Build

```bash
npm run build
```

## Tests

```bash
npm run test
```

## Current Scope

- NestJS and TypeScript setup
- MongoDB connection using the official Node.js driver
- Native user and organization repositories
- Runtime document validation and repository index tests

Authentication, organization onboarding, and frontend
integration will be implemented in future PRs.
