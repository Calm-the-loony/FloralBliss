#!/bin/bash
set -euo pipefail
mysql --protocol=socket -uroot -p"${MYSQL_ROOT_PASSWORD}" floral_bliss < /tmp/floral_bliss.sql
