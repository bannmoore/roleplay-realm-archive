#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

source "$(dirname "${BASH_SOURCE[0]}")/../_shared.sh"

DUMP_FILENAME=cas_db.dump

# move and run script
scp_to_host ./$DUMP_FILENAME "$JUMP_SERVER_VOLUME_PATH/$DUMP_FILENAME"
