-- +goose Up
-- +goose StatementBegin
CREATE TABLE characters(
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  story text,
  image_uri text,
  universe_id bigint REFERENCES universes ON DELETE SET NULL,
  user_id bigint REFERENCES users ON DELETE SET NULL,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin
DROP TABLE characters;

-- +goose StatementEnd
