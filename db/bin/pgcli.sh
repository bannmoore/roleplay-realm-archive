#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

source "$(dirname "${BASH_SOURCE[0]}")/_shared.sh"

pgcli "$(get_db_url)" "$@"