-- +goose Up
-- +goose StatementBegin
CREATE TABLE users(
  id bigserial PRIMARY KEY,
  discord_id text UNIQUE NOT NULL,
  discord_username text NOT NULL,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin
DROP TABLE users;

-- +goose StatementEnd
