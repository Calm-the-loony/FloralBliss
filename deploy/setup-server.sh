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
  docker.io \
  nginx certbot python3-certbot-nginx \
  ufw

COMPOSE_VER="${DOCKER_COMPOSE_VERSION:-v2.32.4}"
case "$(uname -m)" in
  x86_64) COMPOSE_ARCH=x86_64 ;;
  aarch64|arm64) COMPOSE_ARCH=aarch64 ;;
  *) echo "Неподдерживаемая архитектура: $(uname -m)"; exit 1 ;;
esac
mkdir -p /usr/local/lib/docker/cli-plugins
curl -fsSL "https://github.com/docker/compose/releases/download/${COMPOSE_VER}/docker-compose-linux-${COMPOSE_ARCH}" \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

systemctl enable --now docker nginx

ufw allow OpenSSH 2>/dev/null || ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

if [[ -n "${SUDO_USER:-}" ]] && id "$SUDO_USER" &>/dev/null; then
  usermod -aG docker "$SUDO_USER" || true
fi

echo "Готово. Если использовали sudo не от root — перелогиньтесь или выполните: newgrp docker"
