# Roleplay Realm DB

## Dependencies

- [Docker Desktop](https://docs.docker.com/desktop/)
- [Goose](https://github.com/pressly/goose)

Also requires the `roleplay-realm-archive` and `roleplay-realm-archive-infra` repos.

## Commands

Run database: See the `roleplay-realm-archive-infra` project.

Run migrations:

```sh
./bin/migrate up
```

Create migration:

```sh
./bin/migrate create new_migration_name sql
```