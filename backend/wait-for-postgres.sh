#!/usr/bin/env sh
# wait-for-postgres.sh
# Usage: wait-for-postgres.sh <host> <port>

set -e

host="$1"
port="$2"

echo "⏳ Waiting for Postgres at $host:$port..."
until nc -z "$host" "$port"; do
  sleep 1
done

echo "✅ Postgres is up - executing command"
exec "$@"
