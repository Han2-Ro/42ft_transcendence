#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/../.env"

if [ -f "$ENV_FILE" ]; then
  set -a
  source "$ENV_FILE"
  set +a
fi

BASE_URL="${SERVICE_URL_NEXTJS:-https://localhost}"
INTERNAL_SECRET="${INTERNAL_SECRET:?INTERNAL_SECRET is not set}"
NUM_GAMES="${1:-10}"
WHITE_PLAYER_ID="${2:?Usage: $0 <num_games> <white_player_id> <black_player_id>}"
BLACK_PLAYER_ID="${3:?Usage: $0 <num_games> <white_player_id> <black_player_id>}"

WINNERS=("white" "black" "draw")
REASONS=("checkmate" "resignation" "timeout" "stalemate")

echo "Creating $NUM_GAMES games between player $WHITE_PLAYER_ID (white) and $BLACK_PLAYER_ID (black)..."

for ((i = 1; i <= NUM_GAMES; i++)); do
  WINNER=${WINNERS[$((RANDOM % 3))]}
  REASON=${REASONS[$((RANDOM % 4))]}

  RESPONSE=$(curl -sk -o /dev/null -w "%{http_code}" \
    -X POST "$BASE_URL/api/internal/game" \
    -H "Content-Type: application/json" \
    -H "x-internal-secret: $INTERNAL_SECRET" \
    -d "{\"whitePlayerId\": $WHITE_PLAYER_ID, \"blackPlayerId\": $BLACK_PLAYER_ID, \"winner\": \"$WINNER\", \"reason\": \"$REASON\"}")

  if [ "$RESPONSE" == "200" ]; then
    echo "  [$i/$NUM_GAMES] winner=$WINNER reason=$REASON ✓"
  else
    echo "  [$i/$NUM_GAMES] FAILED (HTTP $RESPONSE)"
  fi
done

echo "Done."
