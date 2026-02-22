# How to Prompt AI Agents for Features, Enhancements, and Bug Fixes

This guide helps developers (and AI agents) give effective prompts so work stays **consistent** and **safe**. Use it when asking for new features, enhancements, or bug fixes. The last section reflects **lessons from real agent sessions** in this repo.

---

## 1. Context to attach

When asking for a new feature or fix, **attach the right context** so the agent can work accurately:

- **Relevant plan** – If the work relates to a written plan (e.g. invite flow, org creation), attach or reference it. For phased work, **cite the exact phase and line range** (e.g. “Phase 3 context → @plan (51–54)”).
- **What’s already done** – When working in phases, state clearly: “Phase 1 and 2 are already implemented; implement Phase 3 and 4.” This avoids redoing work or conflicting changes.
- **Area of the codebase** – Name the area: e.g. **auth**, **org members**, **permissions**, **invite flow**.
- **Key files** – Mention files the agent should be aware of, for example:
  - Auth: `server/src/middlewares/auth.middleware.js`, auth limiter
  - RBAC: `server/src/constants/rbac.js`, `requirePermission` usage
  - Org/select-org: org-scoped token flow, select-org UI and APIs

The more precise the context, the less risk of changes in the wrong place.

---

## 2. Branch and commit

- **Branch** – Name the branch explicitly in the prompt (e.g. “On branch `cursor/feat/invite-team-member-flow`”). Do not prompt for direct commits to `main` unless it’s an agreed exception.
- **Commit prefixes** – Use clear prefixes: `feat:`, `fix:`, `chore:`, `docs:`, etc. For phased work, **phase prefixes** help review (e.g. `phase3/feat: ...`, `phase5/fix: ...`).
- **Cadence** – Ask to “commit on every successful small task” or “commit when one small, reviewable part is completed” so changes are easy to review.
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

### For **planning** (dividing work into phases)

When you want a plan rather than implementation:

- **Goal and UX** – Describe the desired behavior in order (e.g. unauthenticated → login → verify → list orgs → select org → in-org app; no auth calls until login, no in-org APIs until org selected).
- **Attach repo docs** – Reference `README.md`, `docs/CODE_STRUCTURE.md`, `docs/SETUP.md` (and `.github/copilot-instructions.md` if present) so the agent understands the stack and layout.
- **Ask explicitly** – “Help me to plan and divide the task properly so we’re both clear during implementation” or “Divide into phases and suggest commit prefixes per phase.” The agent can then produce a phased plan (e.g. Phase 1–6) that you use in later prompts.

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

## 6. Role and scope (optional but helpful)

- **Persona** – For large or security-sensitive work, briefly set the role: e.g. “You are a senior software developer with expertise in SaaS web development and system design.” This steers the agent toward consistent, production-ready choices.
- **Explicit constraints** – When the change touches auth or multi-tenant isolation, state the rule: e.g. “No loophole in authentication and authorization; a user of org 1 must not access org 2’s info or features; fully controlled with auth, RBAC, org-scoped.”

---

## 7. Follow-ups, review, and handoff

- **Clarifying product choice** – If the plan is ambiguous (e.g. “both owner and members can invite”), send a short follow-up: e.g. “Backend currently requires org:manage_members; we can keep admin-only invite or extend so all org members can invite—which do we want?” Then the next phase can implement the chosen behavior.
- **Asking for review** – To have the agent (or another agent) review completed work: “Check branch X and @transcript … Review the changes properly” or “Review phase 1 code; if there are changes to make, tell that agent.”
- **Handing off to the next phase** – You can start the next phase in a **new chat** with: “Phase N is done on branch X. Implement Phase N+1 from the plan; also apply the Phase N review fixes [if any].” You don’t need to wait for a formal “green flag” if the plan and review items are clear.
- **Concrete UX/flow** – For behavioral changes (e.g. reload with persisted org, switch org), spell out the flow: “In useAuth init, when both accessToken and storedOrgId exist: call refreshToken() first; on success update token then call selectOrg(storedOrgId); on refresh failure clear token and org so the user isn’t stuck.”

---

## 8. QA, tests, and bug fixes

- **Attach evidence** – When a test or command fails, attach the **terminal output** (e.g. `@terminals/8.txt:52-110`) so the agent sees the exact error.
- **Numbered tasks** – For fixes, list tasks clearly: “1. Fix Jest config (remove X), then run npm test and fix any failing tests. 2. Add seed-dev.js or remove the script until it exists. 3. Add a short ‘Run locally’ section to README.”
- **Retest and commit** – Ask explicitly: “Retest again, review the codebase changes, and commit accordingly” so the agent runs tests and commits fixes in logical chunks.

---

## Quick checklist

- [ ] Attached or referenced the right plan and codebase area (and phase/line range if phased)
- [ ] Stated what’s already done vs what to implement (for phased work)
- [ ] Mentioned key files (auth, RBAC, org/select-org) if relevant
- [ ] Named the branch and asked for clear commit prefixes (and phase prefix if applicable)
- [ ] Asked for “commit on every small task” or similar when you want reviewable chunks
- [ ] For features: described UX, org/permission, and in-org vs public
- [ ] For fixes: described bug, steps, expected vs actual, and area; attached terminal/output if failing
- [ ] Reminded not to break auth, RBAC, or invite-only join (if applicable)
- [ ] Asked for re-test: `npm test` in server and manual login → select-org → invite when relevant
- [ ] For review/handoff: specified branch and transcript or asked to apply review fixes in next phase
