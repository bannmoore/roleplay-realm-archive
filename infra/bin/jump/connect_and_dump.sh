#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

source "$(dirname "${BASH_SOURCE[0]}")/../_shared.sh"

DUMP_SCRIPT_FILENAME=dump.sh
DUMP_FILENAME=rra_db.dump

# create dump script
cat >./$DUMP_SCRIPT_FILENAME <<EOL
#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

pg_dump $DATABASE_URL > $JUMP_SERVER_VOLUME_PATH/$DUMP_FILENAME
EOL

chmod +x ./$DUMP_SCRIPT_FILENAME

# move and run script
scp_to_host ./$DUMP_SCRIPT_FILENAME "$JUMP_SERVER_VOLUME_PATH/$DUMP_SCRIPT_FILENAME"
doctl compute ssh $JUMP_SERVER_DROPLET_NAME \
  --ssh-key-path $SSH_KEY \
  --ssh-command "$JUMP_SERVER_VOLUME_PATH/$DUMP_SCRIPT_FILENAME"
scp_from_host "$JUMP_SERVER_VOLUME_PATH/$DUMP_FILENAME" ./$DUMP_FILENAME

# cleanup
rm ./$DUMP_SCRIPT_FILENAME
