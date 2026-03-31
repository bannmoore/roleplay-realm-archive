#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

# install dependencies
sudo apt-get install golang-go python3-pip libpq-dev python-dev-is-python3

# install goose
if [[ $(which goose) ]]; then
  echo "Skipping goose installation."
else
  curl -fsSL \
    https://raw.githubusercontent.com/pressly/goose/master/install.sh |\
    sh 
fi

# install pgcli
if [[ $(which pgcli) ]]; then
  echo "Skipping pgcli installation."
else
  sudo pip install --break-system-packages pgcli
fi

# install postgresql

if [[ $(which psql) ]]; then
  echo "Skipping postgres installation."
else
  # Ref: https://dev.to/johndotowl/postgresql-17-installation-on-ubuntu-2404-5bfi
  sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
  curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo gpg --dearmor -o /etc/apt/trusted.gpg.d/postgresql.gpg
  sudo apt update -y
  # Ref: https://docs.digitalocean.com/support/how-do-i-fix-the-pg_dump-aborting-because-of-server-version-mismatch-error/
  sudo apt install postgresql-client-17 -y
fi