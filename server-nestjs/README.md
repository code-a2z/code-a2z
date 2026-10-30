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

The NestJS backend currently uses five MongoDB models:
- User
- Subscriber
- Organization
- Organization Member
- Set Password Token

The collection names and schemas follow the existing Express backend.

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
- MongoDB connection using Mongoose
- User and organization database models
- Schema validation and index tests

Authentication, organization onboarding, and frontend
integration will be implemented in future PRs.