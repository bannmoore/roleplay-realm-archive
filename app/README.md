# Roleplay Realm

## Integrations

- [Auth.js](https://authjs.dev/)

## First-time Setup

```sh
npx auth
npm install
```

## Run locally

```sh
npm run dev
```

## Testing

### E2E

```sh
# infra: start local database
./bin/local/db_up.sh

# app: start the dev server with the mock api server
DISCORD_API_URL=http://localhost:9000 npm run dev

# app: run tests
npm run cy:run
```
