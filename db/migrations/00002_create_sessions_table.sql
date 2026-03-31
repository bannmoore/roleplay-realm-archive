-- +goose Up
-- +goose StatementBegin
CREATE TABLE sessions(
  user_id bigint UNIQUE REFERENCES users ON DELETE CASCADE,
  token text NOT NULL,
  created_at timestamp NOT NULL DEFAULT now(),
  expires_at timestamp NOT NULL
);

-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin
DROP TABLE sessions;

-- +goose StatementEnd
