# How to Prompt AI Agents for Features, Enhancements, and Bug Fixes

This guide helps developers (and AI agents) give effective prompts so work stays **consistent** and **safe**. Use it when asking for new features, enhancements, or bug fixes.

---

## 1. Context to attach

When asking for a new feature or fix, **attach the right context** so the agent can work accurately:

- **Relevant plan** – If the work relates to a written plan (e.g. invite flow, org creation), attach or reference it.
- **Area of the codebase** – Name the area: e.g. **auth**, **org members**, **permissions**, **invite flow**.
- **Key files** – Mention files the agent should be aware of, for example:
  - Auth: `server/src/middlewares/auth.middleware.js`, auth limiter
  - RBAC: `server/src/constants/rbac.js`, `requirePermission` usage
  - Org/select-org: org-scoped token flow, select-org UI and APIs

The more precise the context, the less risk of changes in the wrong place.

---

## 2. Branch and commit

- **Branch** – Work on a **feature branch** (e.g. `cursor/feat/my-feature`). Do not prompt for direct commits to `main` unless it’s an agreed exception.
- **Commit prefixes** – Use clear prefixes: `feat:`, `fix:`, `chore:`, `docs:`, etc.
- **Scope** – Prefer **one logical change per commit** when possible; it keeps history clear and reverts easier.

---

## 3. What not to break

When prompting, **explicitly or implicitly preserve** these constraints. Remind the agent if the change touches:

- **Auth** – Login, **pre-org vs org-scoped token**, and **select-org** flow must remain correct. No public signup.
- **RBAC** – `requirePermission`, org-scoped data access, and permission checks must not be bypassed.
- **Invite-only join** – Joining is by invite only; no public self-signup.

If your prompt might affect auth, RBAC, or invite flow, say so (e.g. “Change X without changing auth or RBAC” or “Ensure select-org still works after this”).

---

## 4. Prompting for features vs fixes

### For **features** or **enhancements**

Specify:

- **UX** – What the user sees and does (screens, actions, success/error behavior).
- **Org/permission** – Which org scope and which permission (or role) applies; whether it’s **in-org only** or has a **public** part.
- **Edge cases** – e.g. no org selected, missing permission, multiple orgs.

Example: _“Add a ‘Export members’ button on the team page for users with `members:read`. Only show it when an org is selected. Export as CSV.”_

### For **bug fixes**

Specify:

- **Bug** – Short description of the wrong behavior.
- **Steps** – How to reproduce (user actions, environment if relevant).
- **Expected vs actual** – What should happen vs what happens.
- **Area** – If known, point to the area: auth, invite, team, RBAC, select-org, etc.

Example: _“After accepting an invite, the user is not redirected to the team page. Steps: login → open invite link → accept. Expected: redirect to team page. Actual: stays on invite page. Likely in invite/accept or post-accept redirect.”_

---

## 5. Re-test after changes

After implementing a change:

1. **Server tests** – Run `npm test` in `server/` and fix any failures.
2. **Manual flow (if relevant)** – If the change touches auth or org/invite flow, manually test: **login → select-org → invite flow** (and any new or changed screens).

Include “re-run server tests and, if relevant, manually test login → select-org → invite” in your prompt when you want the agent to assume this follow-up.

---

## Quick checklist

- [ ] Attached or referenced the right plan and codebase area
- [ ] Mentioned key files (auth, RBAC, org/select-org) if relevant
- [ ] Asked for a feature branch and clear commit prefixes
- [ ] For features: described UX, org/permission, and in-org vs public
- [ ] For fixes: described bug, steps, expected vs actual, and area
- [ ] Reminded not to break auth, RBAC, or invite-only join (if applicable)
- [ ] Asked for re-test: `npm test` in server and manual login → select-org → invite when relevant
