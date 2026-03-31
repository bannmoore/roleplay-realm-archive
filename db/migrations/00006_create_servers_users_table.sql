-- +goose Up
-- +goose StatementBegin
CREATE TABLE servers_users(
  user_id bigint REFERENCES users ON DELETE CASCADE NOT NULL,
  server_id bigint REFERENCES servers ON DELETE CASCADE NOT NULL,
  UNIQUE (user_id, server_id)
);

-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin
DROP TABLE servers_users;

-- +goose StatementEnd
