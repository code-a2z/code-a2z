# Cursor Agent Instructions – How to Code in This Repo

This file tells Cursor (and contributors) how to code in this repo so that **style**, **structure**, and **patterns** stay consistent and reusable. Follow it when adding features, fixing bugs, or refactoring.

For full coding standards (naming, linting, formatting, Git workflow), see [.github/copilot-instructions.md](../.github/copilot-instructions.md) and [docs/CODE_STRUCTURE.md](CODE_STRUCTURE.md).

---

## Stack

- **Monorepo:** `client/`, `server/`, `docs/`.
- **Client:** React, Vite, TypeScript, MUI (Material-UI), Jotai. State in `client/src/infra/states/` and shared UI in `client/src/shared/`.
- **Server:** Node, Express, Mongoose, **ESM** (use `import/export` and `.js` in imports). Controllers, routes, middlewares, utils under `server/src/`.

---

## Conventions

### File and folder naming

- **Files:** `kebab-case` (e.g. `auth.middleware.js`, `get-members.js`, `use-auth.ts`).
- **React components:** `PascalCase` exports; component files often `kebab-case` or `index.tsx`.
- **Routes:** `server/src/routes/api/*.routes.js` (e.g. `auth.routes.js`, `organization.routes.js`).
- **Client APIs:** `client/src/infra/rest/apis/` by domain (e.g. `auth/`, `organization/`, `project/`).

### Shared hooks and state

- **Auth and org:** Use `useAuth` from `client/src/shared/hooks/use-auth.ts`; do not duplicate login/org logic.
- **Org and permissions:** Use atoms and helpers in `client/src/infra/states/` (e.g. `selectedOrgId`, permissions, org features). Respect `selectedOrgId` and org switch; do not call in-org APIs before an org is selected.

---

## Auth and RBAC

### Backend

- **In-org APIs** (everything except login, signup, refresh, select-org, accept-invite, and other public routes) **must** use:
  - `authenticateUser` then `requireOrgScope` so only **org-scoped** tokens are accepted.
  - `requirePermission(feature, action)` where the feature is gated by RBAC (e.g. `org:manage_members`, `articles:write`).
- **Never bypass** `requireOrgScope` or `requirePermission` for in-org routes. All in-org APIs are scoped by `req.user.org_id`; never use another org’s context.
- **Constants:** Permissions and role–permission mapping live in `server/src/constants/rbac.js`. Use these constants; do not hardcode permission strings in routes.

### Frontend

- **Permission checks:** Use `useHasPermission(feature, action)` and existing **permission guards** (e.g. `PermissionGuard`, `ProtectedRoute`) to hide or block UI and routes the user is not allowed to access.
- **Org context:** Respect `selectedOrgId` and org switch. Do not call in-org APIs when no org is selected; after org switch, use the new org-scoped token and state.

---

## Reusability

- **Shared UI:** Put reusable components in `client/src/shared/` (e.g. `components/`, `hooks/`, `utils/`). Do not duplicate shared logic in multiple modules.
- **Server helpers:** Shared logic lives in `server/src/utils/` or middlewares in `server/src/middlewares/`. Use `sendResponse` and existing helpers for consistent responses.
- **Constants:** Use `server/src/constants/rbac.js` and `server/src/constants/db.js` (e.g. collection names). Reuse existing APIs and types instead of duplicating.

---

## Testing

- **API tests:** In `server/src/__tests__/`. Run with `npm test` in `server/`. Tests use a dedicated DB (e.g. `code_a2z_test` via `MONGODB_URL`).
- **After adding or changing routes or auth:** Add or update API tests so the auth flow (no token → 401/403, login → pre-org token, select-org → org-scoped token, in-org routes with org-scoped token) and new endpoints are covered.

---

## Docs

- **Env or scripts:** When adding new env vars or npm scripts, update `README.md` or `docs/SETUP.md` and keep `server/.env.example` / `client/.env.example` in sync.
- **Major areas:** When adding a major area (e.g. new feature domain, new route group), keep `docs/CODE_STRUCTURE.md` in sync.

---

## Summary

1. **Stack:** Client (React, Vite, TS, MUI, Jotai); server (Node, Express, Mongoose, ESM); monorepo client/, server/, docs/.
2. **Conventions:** kebab-case files, PascalCase components; routes in `server/src/routes/api/*.routes.js`, APIs in `client/src/infra/rest/apis/`; use `useAuth` and org/permission atoms.
3. **Auth and RBAC:** In-org APIs use org-scoped token; `requireOrgScope` and `requirePermission`; never bypass. Frontend: `useHasPermission` and permission guards; respect selectedOrgId and org switch.
4. **Reusability:** Shared UI in `client/src/shared/`; server helpers in `server/src/utils/` or middlewares; constants in `server/src/constants/rbac.js`; reuse APIs and types.
5. **Testing:** API tests in `server/src/__tests__/`; `npm test` in server/; add/update tests when changing routes or auth.
6. **Docs:** Update README or SETUP when adding env/scripts; keep CODE_STRUCTURE.md in sync for major areas.

This keeps the codebase consistent and makes it easier for agents to add features without breaking auth, RBAC, or structure.
