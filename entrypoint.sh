#!/bin/sh
set -e

# Fix upload dir permissions (volume mount overrides Dockerfile chown)
mkdir -p /app/storage/app/uploads
chown -R portal-app:portal-app /app/storage/app/uploads 2>/dev/null || true

# Drop to portal-app user and start server
exec gosu portal-app node server.js --hostname 0.0.0.0
