#!/bin/sh
set -e

# Run database migrations
until pnpm prisma migrate deploy; do
	echo "Database not redy, retrying in 2s..."
	sleep 2
done

# Start the app
exec pnpm start
