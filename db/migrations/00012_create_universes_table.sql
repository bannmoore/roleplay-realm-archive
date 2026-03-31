-- +goose Up
-- +goose StatementBegin
CREATE TABLE universes(
  id bigserial PRIMARY KEY,
  name text NOT NULL
);

-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin
DROP TABLE universes;

-- +goose StatementEnd
