#!/bin/bash
set -euo pipefail
mysql -uroot -p"${MYSQL_ROOT_PASSWORD}" floral_bliss < /tmp/floral_bliss.sql
