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
- `pnpm run dev:db` - dev server with db
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

### jlomic

Assigned roles: Project Manager, Developer

### aprevrha

Assigned roles: Product Owner, Developer

### hrother

Assigned roles: Techincal Lead/Architect, Developer

## Project Management

We used GitHub issues to have an overview of all tasks. Team members mostly picked tasked themself based on personal preferance and knowledge. We communicated over discord and also worked a lot on together on campus for better and faster communication.

## Technical Stack

## Database Schema

## Features List

## Modules

| Modul                         | Points |
| ----------------------------- | ------ |
| Full Stack Framework          | 2      |
| real-time feature (websocket) | 2      |
| ORM                           | 1      |
| additional Browsers           | 1      |
| game statistics & history     | 1      |
| OAth 2.0 (42 intra)           | 1      |
| 2FA                           | 1      |
| Complete Web based Game       | 2      |
| Remote players                | 2      |
| Multiplayer                   | 2      |
| Add another Game              | 2      |
| TOTAL                         | 17     |

## Individual Contributions

## Resources

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
