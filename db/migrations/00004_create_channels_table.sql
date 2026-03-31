-- +goose Up
-- +goose StatementBegin
CREATE TABLE channels(
  id bigserial PRIMARY KEY,
  discord_id text UNIQUE NOT NULL,
  server_id bigint REFERENCES servers ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  active boolean NOT NULL DEFAULT FALSE,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin
DROP TABLE channels;

-- +goose StatementEnd
