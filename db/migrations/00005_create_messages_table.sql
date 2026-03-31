-- +goose Up
-- +goose StatementBegin
CREATE TABLE messages(
  id bigserial PRIMARY KEY,
  discord_id text UNIQUE NOT NULL,
  channel_id bigint REFERENCES channels ON DELETE CASCADE NOT NULL,
  author_id bigint REFERENCES users ON DELETE CASCADE NOT NULL,
  content text,
  discord_published_at timestamp NOT NULL,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin
DROP TABLE messages;

-- +goose StatementEnd
