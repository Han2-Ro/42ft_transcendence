#!/bin/sh
set -e

# Run database migrations
pnpm prisma migrate deploy

# Start the app
exec pnpm start
