-- +goose Up
-- +goose StatementBegin
CREATE TABLE servers(
  id bigserial PRIMARY KEY,
  discord_id text UNIQUE NOT NULL,
  name text NOT NULL,
  icon_hash text,
  active boolean NOT NULL DEFAULT FALSE,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin
DROP TABLE servers;

-- +goose StatementEnd
