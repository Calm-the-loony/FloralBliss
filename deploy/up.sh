#!/bin/bash
set -euo pipefail

DOMAIN="${1:-s24.clv-digital.tech}"
SSL_EMAIL="${2:-admin@clv-digital.tech}"

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEPLOY_DIR="$REPO_ROOT/deploy"
COMPOSE_FILE="$DEPLOY_DIR/docker-compose.yml"
ENV_FILE="$DEPLOY_DIR/.deploy.env"
NGINX_SITE="/etc/nginx/sites-available/floralbliss.conf"

if [[ ! -f "$REPO_ROOT/floral_bliss.sql" ]]; then
  echo "Нет файла floral_bliss.sql в корне репозитория."
  exit 1
fi

chmod +x "$DEPLOY_DIR/mysql/zz-import.sh" 2>/dev/null || true

if [[ ! -f "$ENV_FILE" ]]; then
  MYSQL_ROOT_PASSWORD="$(openssl rand -hex 24)"
  JWT_SECRET="${JWT_SECRET:-floral-bliss-secret-key-2026}"
  cat >"$ENV_FILE" <<EOF
MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
JWT_SECRET=${JWT_SECRET}
CLIENT_URL=https://${DOMAIN}
EOF
  chmod 600 "$ENV_FILE"
  echo "Создан $ENV_FILE (пароль MySQL сгенерирован)."
fi

sudo docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --build

if [[ ! -d "/etc/letsencrypt/live/${DOMAIN}" ]]; then
  sudo sed "s/__DOMAIN__/${DOMAIN}/g" "$DEPLOY_DIR/nginx/host.conf.template" | sudo tee "$NGINX_SITE" >/dev/null
  sudo rm -f /etc/nginx/sites-enabled/default
  sudo ln -sf "$NGINX_SITE" /etc/nginx/sites-enabled/floralbliss.conf
  sudo nginx -t
  sudo systemctl reload nginx
  sudo certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "$SSL_EMAIL" --redirect
else
  sudo nginx -t
  sudo systemctl reload nginx
fi

echo "Сайт: https://${DOMAIN}"
