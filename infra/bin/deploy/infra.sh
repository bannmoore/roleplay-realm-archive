#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

$(dirname "${BASH_SOURCE[0]}")/../terraform.sh apply