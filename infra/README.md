# Roleplay Realm Archive Infrastructure

## Dependencies

- [Docker Desktop](https://docs.docker.com/desktop/)
- [Terraform](https://developer.hashicorp.com/terraform?product_intent=terraform) (`brew install terraform`)
- [Doctl](https://github.com/digitalocean/doctl) (`brew install doctl`)

This project expects the following repos to be cloned into the same workspace:

- `roleplay-realm-archive`
- `roleplay-realm-archive-db`

## Quick Start

```sh
# roleplay-realm-archive-infra
./bin/local/db_up.sh
./bin/local/app_up.sh

# roleplay-realm-archive-db
./bin/migrate
```

## Deploy

### Prerequisites

This Terraform configuration expects the following resources to already exist:
- A personal access token (generate [here](https://cloud.digitalocean.com/account/api/tokens?i=50c38c))
- A container app registry called "bam"

### Deployment

#### Deploy NextJS app by publishing new Docker image

```sh
./bin/deploy/app.sh
```

#### Deploy DigitalOcean infrastructure

```sh
./bin/terraform.sh plan

./bin/deploy/infra.sh

# ONLY DO THIS IF YOU WANT TO BLOW EVERYTHING UP
./bin/terraform.sh destroy
```

#### (First Time) Set up Jump Server

**Heads up**: This assumes you're running these steps in the applied terraform workspace, with outputs available.

```sh
./bin/jump/connect.sh

# On jump server, generate ssh key.
ssh-keygen -t rsa
cat ~/.ssh/id_rsa.pub
# (copy the public key and add it to GitHub)

# Clone database repo
cd /mnt/rra_jump_server_volume
git clone git@github.com:bannmoore/roleplay-realm-archive-db.git
cd roleplay-realm-archive-db

# Run migrations
source ../.env
./bin/jump_setup.sh
./bin/migrate.sh
```

To run new migrations:

```sh
./bin/jump/connect.sh

cd /mnt/rra_jump_server_volume/roleplay-realm-archive-db
git pull
source ../.env
./bin/migrate.sh
```

## Gotchas

### DigitalOcean expects the amd64 platform

If the published image is built on the arm64 platform, it won't work on Digital Ocean. Check it like so:

```sh
docker image ls | grep bam 
docker inspect <IMAGE_ID> --format '{{.Architecture}}'
```

This _should_ print out amd64. If not, the image needs to be rebuilt with the `--platform=linux/amd64` flag.

### Can not delete default VPCs

If your digitalocean_vpc resource is the first one for a region, it will automatically become the default. In order to run terraform destroy, create another one via the console and set it to default.

## Gratitude to these Resources

- https://tonitalksdev.com/deploying-clojure-like-a-seasoned-hobbyist
- https://slugs.do-api.dev/
- https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-registry/#:~:text=Even%20though%20they're%20related,your%20images%20based%20on%20projects
- https://docs.digitalocean.com/products/volumes/how-to/mount/