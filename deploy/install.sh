#!/bin/bash
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

sudo bash "$DIR/setup-server.sh"
bash "$DIR/up.sh" "${1:-s24.clv-digital.tech}" "${2:-admin@clv-digital.tech}"
