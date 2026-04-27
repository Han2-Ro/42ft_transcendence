_This project has been created as part of the 42 curriculum by fstark, jlomic, aprevrha, hrother._

# ft_transcendence

## Description

42Chess: A full-stack web application for real-time online chess.
Goal: provide a complete platform for live play across classic and multiplayer formats.

Architecture:

- **Next.js** for frontend and non-realtime backend logic
- **Socket.IO game server** for realtime game state and communication

Game modes:

- Chess
- Timed Chess
- 4-Player Chess
- Timed 4-Player Chess

## Instructions

### Prerequisites

- Docker
- pnpm

### Getting Started

Copy `.env.example` to `.env`. Optionally change the values as desired.

To run it in production run

```bash
make run
```

Now you can open [https://localhost](https://localhost) in your browser.

To run the development server (with hot reload):

```bash
pnpm install # run this at root of git directory to install dependecies
pnpm run dev
```

Note: this does not start a database.
You can start a postgres db seperatly yourself or use `pnpm run dev:db`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### make scripts

- `make run` - start everything with building images freshly
- `make down` - stop
- `make reset` - stop and reset everything inlcuding volumes

### pnpm scripts

- `pnpm run dev` - run development server with hot reload
- `pnpm run build` - build
- `pnpm run start` - run the project after `pnpm build`
- `pnpm run lint` - check eslint
- `pnpm run format:check` - check the fromatting without writing
- `pnpm run format` - format all files with writing and saving

## Folder Structure

- **nextjs/** - Next.js frontend and backend API
  - **nextjs/src/app/** - file-system based App Router
  - **nextjs/public/** - static assets
- **game-server/** - Real-time game server using Socket.IO
- **shared/** - shared logic package that is used in the game-server and nextjs frontend:
  - shared types
  - game logic (both frontend and game-server validate moves using the same functions)
- **tests/** - [playwright tests](#tests)

## Tests

There are end-to-end tests with playwright in `./tests/`:

- `pnpm --filter tests exec playwright install` to install playwright
- `pnpm test` to execute them
- `pnpm test:ui` to see what the tests are doing
- For timed-mode E2E tests, set `GAME_TIMED_MODE_SECONDS` (e.g. `8`) before `make run` to avoid long waits

It will be much apreciated if you write tests for everything you implement!

## Team Information

### fstark

Assigned roles: Developer  
Responsibilities: Socketserver, game logic (Chess / 4PlayerChess / Connect4)

### jlomic

Assigned roles: Project Manager, Developer  
Responsibilities: Backend (APIs, DB, Server actions...)

### aprevrha

Assigned roles: Product Owner, Developer  
Responsibilities: Frontend

### hrother

Assigned roles: Technical Lead/Architect, Developer  
Responsibilities:

- Frontend: design & implementation
- Project setup and architecture: Defining how different parts of the code interact with each other

## Project Management

- **Work organization:** We used issue-based planning and distributed tasks by ownership area (game logic, frontend, auth/backend, infra/testing), while still pairing on complex parts.
- **Task distribution:** Team members mostly picked issues based on expertise and current workload; ownership was adjusted when blockers appeared.
- **Meetings/sync:** Regular short syncs on Discord and in-person collaboration on campus for faster decisions and debugging.
- **Project management tools:** GitHub Issues + Git history/PR workflow for tracking implementation and review.
- **Communication channels:** Discord and direct on-campus communication.
- **Code reviews:** we required review and approval for each pull-request by another teammeber. This helped with catching mistakes early and keeping a better [Bus Factor](https://en.wikipedia.org/wiki/Bus_factor).

## Technical Stack

### Frontend

- **Next.js 16 (App Router) + React 19 + TypeScript**
- **Tailwind CSS 4** for styling
- **socket.io-client** for realtime game communication

**Why:** Next.js gave us one framework for UI plus server-side/backend routes, which reduced complexity and fit the Full-Stack module requirement.

### Backend

- **Next.js server actions + route handlers** for auth, profile/settings, stats/history APIs
- **Dedicated Node.js Socket.IO game server** for realtime multiplayer state
- **Shared TypeScript package (`shared/`)** for game rules and event contracts used by both frontend and server

**Why:** Splitting classic backend tasks and realtime state made the architecture easier to reason about and scale independently.

### Database

- **PostgreSQL 16** with **Prisma ORM**

**Why:** Relational modeling matches users, matches, and stats well; Prisma gives type-safe queries and faster schema iteration for a TypeScript codebase.

### Other significant technologies

- **Docker / Docker Compose / Traefik** for reproducible local/prod-like setup and HTTPS routing
- **JOSE + bcrypt + otplib + qrcode** for secure auth, password hashing, and 2FA setup/verification
- **Playwright** for end-to-end browser testing
- **GitHub Actions** for lint/format/test automation

## Database Schema

<img width="1758" height="921" alt="image" src="https://github.com/user-attachments/assets/7a59b30f-986f-478b-aa18-3df51949ca43" />

## Features List

- **2 player chess with two game modes (no time limit, 10min.).** (hrother, fstark, jlomic and aprevrha)
- **4 player chess with two game modes (no time limit, 10min.).** (hrother, fstark, jlomic and aprevrha)
- **4connect game with two game modes (no time limit, 10min.).** (hrother, fstark, jlomic and aprevrha)
- **User managment:** (hrother, fstark and jlomic)
  - Changing username
  - Changing password
  - Linking 42 account to the 42 chess account
  - Enabling 2FA (6-digit code verification)
- **User stats** (hrother, fstark and jlomic)
- **Game history** (hrother and jlomic)
- **Leaderboard** (hrother and jlomic)
- **Levels** (jlomic)
- **Remote players** (fstark and hrother)
- **Multiplayer game** (hrother, fstark, jlomic and aprevrha)
- **Real time sync. over websockets** (fstark and hrother)

## Modules

### Points overview

| Module                        | Type  | Points |
| ----------------------------- | ----- | ------ |
| Full Stack Framework          | Major | 2      |
| Real-time feature (WebSocket) | Major | 2      |
| ORM                           | Minor | 1      |
| Additional Browsers           | Minor | 1      |
| Game statistics & history     | Minor | 1      |
| OAuth 2.0 (42 intra)          | Minor | 1      |
| 2FA                           | Minor | 1      |
| Complete Web-based Game       | Major | 2      |
| Remote players                | Major | 2      |
| Multiplayer                   | Major | 2      |
| Add another game              | Major | 2      |
| **TOTAL**                     |       | **17** |

### Module implementation details

- **Full Stack Framework**
  - We used Next.js for front and backend.
- **Real-time feature**
  - We used WebSockets for real time communication between Next.js and Game server.
- **ORM**
  - We used PrismaORM for creating DB models.
- **Additional Browsers**
  - We support different browsers.
- **Game statistics & history**
  - We have user stats and user game history.
- **OAuth 2.0 (42 intra)**
  - We support OAuth, you can login with your 42 account. We use 42 APIs.
- **2FA**
  - We use otplib and qrcode to generate secret and QR code. Can be used with any auth app to enter 6 digit code.
- **Complete Web-based Game**
  - Full web based chess game and 4connect game.
- **Remote players**
  - Players can play from any device which is on the same network as server.
- **Multiplayer**
  - 4 Player chess game mode.
- **Add another game**
  - 4connect game with no time limit and 10min limit mode.

## Individual Contributions

### fstark

Wrote the Games logic and the Socketserver (basically everything in the game-server and shared folder) and wrote the worst looking frontend for the games ever seen (until it got fixed by someone else)

### jlomic

Blood, sweat and tears. A lot of nerves, time and dedication.

### aprevrha

Playercards, Gamepage, Frontend, fixes and improvements.

### hrother

See [Features List](#features-list) and [Team Information](#team-information)

## Resources

### Image Sources

- **[Wikipedia](https://commons.wikimedia.org/wiki/Template:SVG_chess_pieces)** - Chess pieces (also credited in the credits page)
- **[SVG Repo](https://www.svgrepo.com/)** - some of the icons (also credited in the credits page)

### Documentation

- **[Next.js](https://nextjs.org/docs)** - React framework for frontend and backend
- **[Docker](https://docs.docker.com/)** - Containerization
- **[TypeScript](https://www.typescriptlang.org/docs/)** - Type-safe development
- **[Tailwind CSS](https://tailwindcss.com/docs)** - Styling
- **[Socket.IO](https://socket.io/docs/v4/)** - Real-time bidirectional communication for game logic
- **[Playwright](https://playwright.dev/docs/intro)** - Automated end-to-end tests

### Articles

- [Choosing the Right Architecture for Socket Communication in Next.js: A Comprehensive Guide](https://www.wisp.blog/blog/choosing-the-right-architecture-for-socket-communication-in-nextjs-a-comprehensive-guide)
- [How to use WebSockets with Next.js](https://www.keithbartholomew.com/blog/posts/2023-12-20-how-to-use-websockets-with-nextjs/)

### AI

Models and Software used:

- Gemini
- Claude
- VSCode Copilot Chat
- Pi Agent

We used AI to

- brainstoarm ideas
- research
- write playwright testcases
- do tedious refactors
- prototype
