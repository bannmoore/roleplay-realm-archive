#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

source "$(dirname "${BASH_SOURCE[0]}")/../_shared.sh"

(
  cd "$(dirname "${BASH_SOURCE[0]}")/../../docker"

  doctl auth init --access-token "$DIGITALOCEAN_ACCESS_TOKEN"
  doctl registry login --expiry-seconds 86400

  docker compose build app
  docker push registry.digitalocean.com/bam/roleplay-realm-archive

  doctl registry logout
)