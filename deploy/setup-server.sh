#!/bin/bash
set -euo pipefail

if [[ "${EUID:-}" -ne 0 ]]; then
  echo "Запустите: sudo bash $0"
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y --no-install-recommends \
  ca-certificates curl git openssl gettext-base \
  docker.io docker-compose-plugin \
  nginx certbot python3-certbot-nginx \
  ufw

systemctl enable --now docker nginx

ufw allow OpenSSH 2>/dev/null || ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

if [[ -n "${SUDO_USER:-}" ]] && id "$SUDO_USER" &>/dev/null; then
  usermod -aG docker "$SUDO_USER" || true
fi

echo "Готово. Если использовали sudo не от root — перелогиньтесь или выполните: newgrp docker"
