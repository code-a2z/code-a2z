## Hey <𝚌𝚘𝚍𝚎𝚛𝚜/>! 👋

<p align="center">
  <img src="https://readme-typing-svg.herokuapp.com?font=JetBrains+Mono&weight=700&size=24&duration=2800&pause=1000&color=007ACC&center=true&vCenter=true&width=800&lines=Welcome+To+The+Code+A2Z+Project;Open-Source+Learning+%26+Collaboration+Platform;Built+for+Developers+by+Developers;Your+Next+Big+Commit+Starts+Here!;Code.+Commit.+Conquer!;Collaborate,+Learn,+and+Contribute!" alt="Typing SVG" />
</p>

<div align="center">

  <p>
    <a href="https://www.buymeacoffee.com/avdheshvarshney">
      <img src="https://img.shields.io/badge/Buy%20Me%20a%20Coffee-ffdd00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black" />
    </a>
    <a href="https://discord.gg/tSqtvHUJzE">
      <img src="https://img.shields.io/badge/Discord-%235865F2.svg?style=for-the-badge&logo=discord&logoColor=white" />
    </a>
  </p>

  <p>
    <img src="https://img.shields.io/github/repo-size/Code-A2Z/code-a2z" />
    <img src="https://img.shields.io/github/languages/count/Code-A2Z/code-a2z" />
    <img src="https://img.shields.io/github/stars/Code-A2Z/code-a2z" />
    <img src="https://img.shields.io/github/forks/Code-A2Z/code-a2z" />
    <img src="https://img.shields.io/github/last-commit/Code-A2Z/code-a2z" />
    <img src="https://img.shields.io/github/license/Code-A2Z/code-a2z" />
    <br />
    <img src="https://img.shields.io/github/issues-raw/Code-A2Z/code-a2z" />
    <img src="https://img.shields.io/github/issues-closed-raw/Code-A2Z/code-a2z" />
    <img src="https://img.shields.io/github/issues-pr-raw/Code-A2Z/code-a2z" />
    <img src="https://img.shields.io/github/issues-pr-closed-raw/Code-A2Z/code-a2z" />
  </p>

</div>

An open-source, multi-tenant platform for developers. Users belong to one or more organizations, and roles and permissions are scoped per organization. Access is invite-only.

- **Client:** React 19, TypeScript, Vite, Tailwind CSS v4, React Aria Components (`client/`)
- **Server:** Node.js, Express, MongoDB / Mongoose (`server/`)

> [!NOTE]
> The app is being rebuilt from a minimal base. Only the auth and organization flow is active right now. Work is tracked in [GitHub Issues](https://github.com/Code-A2Z/code-a2z/issues).

### Prerequisites

- **Node.js** v18 or newer
- **MongoDB** running locally (default `mongodb://localhost:27017`)

### Quick start

```bash
# Install dependencies (root, client, server)
npm run install:both

# Point the client at your local server
cp client/.env.example client/.env

# Create the first organization + owner account
cd server && npm run seed:dev && cd ..

# Start client and server together
npm run dev
```

> [!TIP]
> Open [http://localhost:5173](http://localhost:5173) and sign in with `dev@localhost` / `DevAdmin123`. The API runs on [http://localhost:8000](http://localhost:8000).

### Environment variables

**Client** (`client/.env`, see `client/.env.example`):

| Variable                 | Description                  | Example                 |
| ------------------------ | ---------------------------- | ----------------------- |
| `VITE_SERVER_DOMAIN`     | Backend API base URL         | `http://localhost:8000` |
| `VITE_ORGANISATION_NAME` | Product name shown in the UI | `Code A2Z`              |

**Server** (`server/.env`, see `server/.env.example`). The server runs locally without a `.env` file. These are the variables you're most likely to change:

| Variable                                           | Description                                                       | Example                              |
| -------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------ |
| `MONGODB_URL`                                      | MongoDB connection string                                         | `mongodb://localhost:27017/code-a2z` |
| `JWT_SECRET_ACCESS_KEY` / `JWT_SECRET_REFRESH_KEY` | Token signing secrets (insecure defaults are used if unset)       | any long random string               |
| `VITE_CLIENT_DOMAIN`                               | Client URL used in invite and set-password links                  | `http://localhost:5173`              |
| `PLATFORM_ADMIN_ORG_ID`                            | Org whose owner gets the admin permission (printed by `seed:dev`) | `6adc8d8a…`                          |

> [!WARNING]
> If `client/.env` is missing, the client falls back to the **deployed** API and your local accounts won't work ("Email not found").

### How access works

```
1. No public signup. Accounts come from the seed, an approved org request, or an invite.
2. Request an org  → /request-org             (creates a pending org)
3. Approve it      → npm run approve-request   (prints a /set-password link)
4. Owner sets password → signed in as owner of the new org
5. Owner invites members → npm run list-invite-links prints /accept-invite links
```

Server helpers, run from `server/`:

```bash
npm run seed:dev                                   # default org + dev@localhost owner
npm run approve-request -- --email=you@example.com # approve a pending org request
npm run list-invite-links                          # print pending invite links
```

### Project structure

```
client/            React app (see client/README.md for UI and auth details)
server/
  src/routes/      Route registry (paused features are commented out in index.js)
  src/controllers/ Request handlers, one folder per resource
  src/models/      Mongoose models
  src/db/          Seed and admin CLI scripts
  src/__tests__/   API tests
```

### Scripts

From the repo root:

| Command                | Description                          |
| ---------------------- | ------------------------------------ |
| `npm run install:both` | Install root, client and server deps |
| `npm run dev`          | Start client and server together     |
| `npm run client`       | Start the client only                |
| `npm run server`       | Start the server only                |
| `npm run lint`         | ESLint for client and server         |
| `npm run format`       | Format everything with Prettier      |
| `npm run format:check` | Fail if anything is not formatted    |

Run API tests from `server/` with `npm test`. They use a separate `code_a2z_test` database.

### Contributing

1. Pick an issue from [GitHub Issues](https://github.com/Code-A2Z/code-a2z/issues), or open one with the [bug report](./.github/ISSUE_TEMPLATE/bug-report.yml) or [feature request](./.github/ISSUE_TEMPLATE/feature-request.yml) template.
2. Branch from `main`, keep the change focused, and run `npm run lint` and `npm run format:check` before opening a PR.
3. Follow the [Code of Conduct](./CODE_OF_CONDUCT.md).

> [!TIP]
> To add a page, create it under `client/src/modules/`, add a route in `client/src/App.tsx`, and add a nav entry in `client/src/app/app-shell.tsx`.
