#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

source "$(dirname "${BASH_SOURCE[0]}")/_shared.sh"

goose -dir migrations postgres "$(get_db_url)" "${@:-up}"