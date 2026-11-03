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
4. Configure the required JWT settings shown in `.env.example`.
5. Start the backend using npm run start:dev.

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

## Authentication configuration

The server will not start without separate access and refresh JWT secrets and
their expiration settings. `CLIENT_ORIGIN` is an exact, comma-separated CORS
allowlist; it is required in production because credentialed CORS must not use
a permissive origin.

The implemented authentication routes are available under `/api/v1/auth`:

- `POST /login`
- `POST /refresh`
- `GET /session`
- `POST /select-org`
- `POST /logout`
- `PATCH /change-password`

The existing `/api/auth` paths are also exposed as a temporary compatibility
alias for the current frontend. Login returns a pre-organization access token
and stores its refresh token in an HTTP-only cookie. Selecting an active
organization returns an organization-scoped access token whose permissions are
derived from the current membership role and enabled organization features.

Logout clears the browser refresh-token cookie and tells the client to clear
its in-memory access token and selected organization. It does not revoke an
access or refresh JWT that was copied before logout; server-side token
revocation and refresh-token rotation are not part of this PR.

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
npm run test:e2e
npm run lint
```

## Current Scope

- NestJS and TypeScript setup
- MongoDB connection using the official Node.js driver
- Native user and organization repositories
- Runtime document validation and repository index tests
- Login, refresh, session, organization selection, logout, and password change
- Pre-organization and organization-scoped JWT guards
- Live organization membership, feature, and permission checks

Public registration, organization onboarding, invitations, and set-password
flows remain outside this backend's current scope.

The authentication rate limiter is intentionally process-local and resets when
the server restarts. A shared store such as Redis is needed before horizontally
scaling the API.
