<a name="top"></a>

## Hey <𝚌𝚘𝚍𝚎𝚛𝚜/>! 👋

<p align="center">
  <img src="https://readme-typing-svg.herokuapp.com?font=JetBrains+Mono&weight=700&size=24&duration=2800&pause=1000&color=007ACC&center=true&vCenter=true&width=800&lines=Welcome+To+The+Code+A2Z+Project;Open-Source+Learning+%26+Collaboration+Platform;Built+for+Developers+by+Developers;Your+Next+Big+Commit+Starts+Here!;Code.+Commit.+Conquer!;Collaborate,+Learn,+and+Contribute!" alt="Typing SVG" />
</p>

<div align="center">

  <p>
    <a href="https://code-a2z-server.vercel.app/">
      <img src="https://img.shields.io/badge/Server%20Link-CC2927?style=for-the-badge&logo=render&logoColor=white">
    </a>
    <a href="https://code-a2z.vercel.app/">
      <img src="https://img.shields.io/badge/Client%20Link-4285F4?style=for-the-badge&logo=vercel&logoColor=white">
    </a>
    <a href="https://documenter.getpostman.com/view/46893887/2sB3QNp8fM">
      <img src="https://img.shields.io/badge/API%20Docs-FF6C37?style=for-the-badge&logo=postman&logoColor=white">
    </a>
  </p>

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

![Babel](https://img.shields.io/badge/Babel-F9DC3e?style=for-the-badge&logo=babel&logoColor=black)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![MUI](https://img.shields.io/badge/MUI-%230081CB.svg?style=for-the-badge&logo=mui&logoColor=white)
![Typescript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![Prettier](https://img.shields.io/badge/prettier-%23F7B93E.svg?style=for-the-badge&logo=prettier&logoColor=black)
![ESLint](https://img.shields.io/badge/ESLint-4B3263?style=for-the-badge&logo=eslint&logoColor=white)

</div>

<p align="center">
  <b>Code A2Z</b> is an open-source project that empowers developers to build, learn, and collaborate through structured modular design and real-time tools.
</p>

## About Code A2Z

> [!NOTE]
> Code A2Z is the unified space for developers to build, learn, and collaborate through real-world open-source contributions.

### :zap: For Developers

Code A2Z is an open-source full-stack platform crafted with React + Vite + MUI on the frontend and Node.js + Express + MongoDB on the backend.
It’s designed with a highly modular architecture, clean folder conventions, atomic JOTAI state management, and real-time editor synchronization, offering developers a modern and maintainable foundation for scalable projects.

### :zap: For Users

Code A2Z is not just another project — it’s an ecosystem built to empower developers.
The platform’s goal is to create a space where ideas turn into collaborative code.
It bridges the gap between solo learning and team development by combining real-time editing, intelligent project organization, subscription-based updates, and structured contribution systems.
Future releases will expand into AI-driven productivity tools, personalized feeds, and real-time collaboration analytics to make it the go-to platform for every developer who wants to build, learn, and grow together.

> [!IMPORTANT]
> You can directly explore the project and start contributing using either setup:
>
> - Frontend only → linked to deployed backend
> - Full-stack setup → both client and server locally
> - Follow the setup method that best fits your contribution focus.
> - You can get required credentials from the `/docs` folder [`SETUP.md`](./docs/SETUP.md).

### Run locally

1. **MongoDB** — Install and start MongoDB (e.g. `mongodb://localhost:27017`).
2. **Env** — From repo root: `cp client/.env.example client/.env` and `cp server/.env.example server/.env`; set `MONGODB_URL` and, for full-stack, `VITE_SERVER_DOMAIN=http://localhost:8000` in `client/.env`.
3. **Server** — `npm run server` (or from `server/`: `npm install` then `npm run dev`). Optional: `npm run seed:dev` to seed the default org.
4. **Client** — `npm run client` (or from `client/`: `npm install` then `npm run dev`).
5. **API tests** — From `server/`: `npm test` (uses `MONGODB_URL`, default `code_a2z_test`).

For full steps and frontend-only vs full-stack modes, see [SETUP.md](./docs/SETUP.md).

### Contributor test accounts

You can log in to the deployed app ([code-a2z.vercel.app](https://code-a2z.vercel.app)) with these accounts to explore and test the platform. After login, select the organization to access the app.

| Role   | Email              | Password       |
| ------ | ------------------ | -------------- |
| Viewer | viewer@codea2z.com | Viewer@CodeA2Z |
| Member | member@codea2z.com | Member@CodeA2Z |
| Admin  | admin@codea2z.com  | Admin@CodeA2Z  |

> [!NOTE]  
> These accounts are for contributor testing only. Do not use them for production or store sensitive data.

## Features Checklist

> [!NOTE]  
> These features represent the current strengths and future goals of **Code A2Z**, focused on scalability, collaboration, and developer productivity.  
> Each item listed here is open for contribution, proposal, and improvement.

- [x] Unified MUI Component & Design Framework (https://github.com/Code-A2Z/code-a2z/pull/1317, https://github.com/Code-A2Z/code-a2z/pull/1291)
- [x] Custom In-App Notification Infrastructure (https://github.com/Code-A2Z/code-a2z/pull/1317)
- [x] Jotai-Driven Global State Architecture (https://github.com/Code-A2Z/code-a2z/pull/1317)
- [x] Separated & Modularized Client–Server Codebase (https://github.com/Code-A2Z/code-a2z/pull/1317, https://github.com/Code-A2Z/code-a2z/pull/1304)
- [x] Real-Time Collaborative Code Editing Engine (https://github.com/Code-A2Z/code-a2z/pull/1317, https://github.com/Code-A2Z/code-a2z/pull/1104)
- [x] Subscription & Email Automation via Resend (https://github.com/Code-A2Z/code-a2z/pull/1294)
- [ ] User Insight & Feedback Collection Module (https://github.com/Code-A2Z/code-a2z/issues/1170)
- [ ] Developer Skill-Based Matchmaking System ()
- [ ] Project & Profile Reputation/Ratings Engine ()
- [ ] Advanced Project Bookmarking & Saved Collections (https://github.com/Code-A2Z/code-a2z/issues/1180)
- [ ] Role-Aware Dashboard & Permissions System ()
- [ ] Email-Based Collaboration Invitations (https://github.com/Code-A2Z/code-a2z/issues/1179)
- [ ] Open Public JSON APIs for Project Data ()
- [ ] Multi-Language Localization & i18n Support (https://github.com/Code-A2Z/code-a2z/issues/1001)
- [ ] AI-Powered Real-Time Discussion Channels (https://github.com/Code-A2Z/code-a2z/issues/788)
- [ ] Live Project Activity Analytics Dashboard (https://github.com/Code-A2Z/code-a2z/issues/1182)
- [ ] Private Project-Specific Notes (https://github.com/Code-A2Z/code-a2z/issues/249)
- [ ] Task Creation & Project Taskboard (https://github.com/Code-A2Z/code-a2z/issues/38)
- [ ] Gamified Habit Tracking & Streak System (https://github.com/Code-A2Z/code-a2z/issues/51)
- [ ] PR Workflow Automation via Webhooks (https://github.com/Code-A2Z/code-a2z/issues/1116)
- [ ] AI-Generated Quiz & Assessment Engine (https://github.com/Code-A2Z/code-a2z/issues/48)
- [ ] Personalized Learning Recommendations Feed (https://github.com/Code-A2Z/code-a2z/issues/1211)
- [ ] AI-Powered Video Streaming & Knowledge Sharing Platform (https://github.com/Code-A2Z/code-a2z/issues/30)

> [!TIP]  
> Each feature aligns with Code A2Z’s mission to make collaborative development **simpler, faster, and smarter**.  
> Review `/client/src/modules` and `/server/src/routes` before contributing for structural consistency.  
> To propose a new idea, use the [**Feature Request Template**](./.github/ISSUE_TEMPLATE/feature-request.yml).

## Community & Support

> [!NOTE]  
> **Code A2Z** thrives because of its active and growing community of developers, designers, and contributors.  
> Join us, share ideas, ask questions, or collaborate on open issues — every contribution counts.

### Join the Discussion

Be part of our developer space where we brainstorm, debug, and build together.

- 💬 **Discord Server** — [Join our Discord](https://discord.gg/tSqtvHUJzE)
- 🧭 **GitHub Discussions** — [Explore active threads](https://github.com/orgs/Code-A2Z/discussions/2)
- 🧾 **Community Board** — [Contribute ideas & suggestions](https://github.com/Code-A2Z/code-a2z/discussions/882)

### Need Help?

> [!TIP]  
> If you encounter issues while setting up or contributing:
>
> - Check the [**Docs**](./docs/) folder for setup guides & API keys configuration.
> - Review the [**Issues**](https://github.com/Code-A2Z/code-a2z/issues) tab for existing bug reports.
> - Or open a new one using our [**Bug Report Template**](./.github/ISSUE_TEMPLATE/bug-report.yml).

> [!IMPORTANT]  
> All discussions and contributions follow our [**Code of Conduct**](./CODE_OF_CONDUCT.md).  
> Respect, collaboration, and professionalism are non-negotiable values of the **Code A2Z** community.

<a href="#top"><img src="https://img.shields.io/badge/⬆-Back%20to%20Top-red?style=for-the-badge" align="right"/></a>
