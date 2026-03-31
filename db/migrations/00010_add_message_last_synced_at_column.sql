-- +goose Up
-- +goose StatementBegin
ALTER TABLE messages ADD COLUMN last_synced_at timestamp;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE messages DROP COLUMN last_synced_at;
-- +goose StatementEnd
