-- +goose Up
-- +goose StatementBegin
ALTER TABLE channels ADD COLUMN last_synced_at timestamp;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE channels DROP COLUMN last_synced_at;
-- +goose StatementEnd
