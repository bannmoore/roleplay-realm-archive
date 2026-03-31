#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

function get_db_url() {
  if [ -z "${DATABASE_URL:-}" ]; then
    echo "postgres://postgres:password@0.0.0.0:5432/postgres?sslmode=disable"
  else
    echo $DATABASE_URL
  fi
}