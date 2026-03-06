# ft_transcendence

A 42 school project

## Prerequisites

- Docker
- pnpm

## Getting Started

Run the development server:

```bash
pnpm install # run this at root of git directory to install dependecies
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

To run it in production, create a `.env` file from `.env.example` and the run

```bash
docker compose up
```

### pnpm scripts

- `pnpm dev` - run development server with hot reload
- `pnpm build` - build
- `pnpm start` - run the project after `pnpm build`
- `pnpm lint` - check eslint
- `pnpm format:check` - check the fromatting without writing
- `pnpm format` - format all files with writing and saving

## Project Structure

- **nextjs/** - Next.js frontend and backend API
  - **nextjs/src/app/** - file-system based App Router
  - **nextjs/public/** - static assets
- **game-server/** - Real-time game server using Socket.IO
- **tests/** - [playwright tests](#tests)

## The Stack

- **[Next.js](https://nextjs.org/docs)** - React framework for frontend and backend
- **Docker** - Containerization
- **TypeScript** - Type-safe development
- **[Tailwind CSS](https://tailwindcss.com/docs/installation)** - Styling
- **Socket.IO** - Real-time bidirectional communication for game logic

## Tests

There are end-to-end tests with playwright in `./tests/`:
 - `pnpm test` to execute them
 - `pnpm test:ui` to see what the tests are doing
 
It will be much apreciated if you write tests for everything you implement!
