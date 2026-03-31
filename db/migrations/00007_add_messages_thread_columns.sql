-- +goose Up
-- +goose StatementBegin
ALTER TABLE messages ADD COLUMN is_thread boolean NOT NULL DEFAULT false;
ALTER TABLE messages ADD COLUMN thread_id bigint REFERENCES messages;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE messages DROP COLUMN thread_id;
ALTER TABLE messages DROP COLUMN is_thread;
-- +goose StatementEnd
