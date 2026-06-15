#!/bin/sh
set -eu

cat > /usr/share/nginx/html/env.js <<EOF
window.__APP_CONFIG__ = {
  APP_API_BASE_URL: "${APP_API_BASE_URL:-http://localhost:5002/api}",
  APP_API_AUTH_URL: "${APP_API_AUTH_URL:-http://localhost:5001/api}",
  APP_API_DELIVERY_URL: "${APP_API_DELIVERY_URL:-http://localhost:5002/api}",
  APP_API_ORDER_URL: "${APP_API_ORDER_URL:-http://localhost:5003/api}",
  APP_API_NOTIFICATION_URL: "${APP_API_NOTIFICATION_URL:-http://localhost:5004/api}"
};
EOF

exec "$@"
