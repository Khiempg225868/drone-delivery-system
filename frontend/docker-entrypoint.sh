#!/bin/sh
set -eu

mkdir -p /tmp/nginx/html
cp -R /opt/app/html/. /tmp/nginx/html/

cat > /tmp/nginx/html/env.js <<EOF
window.__APP_CONFIG__ = {
  APP_API_BASE_URL: "${APP_API_BASE_URL:-/api}",
  APP_API_AUTH_URL: "${APP_API_AUTH_URL:-/api}",
  APP_API_DELIVERY_URL: "${APP_API_DELIVERY_URL:-/api}",
  APP_API_ORDER_URL: "${APP_API_ORDER_URL:-/api}",
  APP_API_NOTIFICATION_URL: "${APP_API_NOTIFICATION_URL:-/api}"
};
EOF

exec "$@"
