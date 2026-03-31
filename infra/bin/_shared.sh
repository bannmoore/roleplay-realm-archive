#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

function get_tf_output() {
  cd "$(dirname "${BASH_SOURCE[0]}")/../terraform"
  terraform output -json "$1" | jq -r .
}

DIGITALOCEAN_ACCESS_TOKEN=$(get_tf_output do_token)
JUMP_SERVER_ADDRESS=$(get_tf_output jump_server_address)
JUMP_SERVER_DROPLET_NAME=$(get_tf_output jump_server_droplet_name)
JUMP_SERVER_VOLUME_PATH=$(get_tf_output jump_server_volume_path)
DATABASE_URL=$(get_tf_output database_url)
SSH_KEY=$(get_tf_output jump_server_ssh_key_path)

function scp_to_host() {
  scp -i $SSH_KEY "$1" "root@$JUMP_SERVER_ADDRESS:$2"
}

function scp_from_host() {
  scp -i $SSH_KEY "root@$JUMP_SERVER_ADDRESS:$1" "$2"
}