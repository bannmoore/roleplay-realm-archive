#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

source "$(dirname "${BASH_SOURCE[0]}")/../_shared.sh"

function create_jump_env() {
  printf "export DATABASE_URL=$DATABASE_URL\n" > .env.jump
}

create_jump_env
scp_to_host ./.env.jump "$JUMP_SERVER_VOLUME_PATH/.env"
rm ./.env.jump

doctl compute ssh $JUMP_SERVER_DROPLET_NAME \
  --ssh-key-path $SSH_KEY