#!/usr/bin/env bash
set -eo pipefail

if [ -z "$1" ]; then
  echo "❌ Error: Backup file path is required!"
  echo "Usage: ./scripts/restore.sh ./backups/eduhub_db_YYYYMMDD_HHMMSS.sql.gz"
  exit 1
fi

BACKUP_FILE="$1"
CONTAINER_NAME="${DB_CONTAINER:-educrm-postgres}"
DB_USER="${DB_USER:-postgres}"
DB_NAME="${DB_NAME:-educrm}"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "❌ Backup file not found: $BACKUP_FILE"
  exit 1
fi

echo "=========================================="
echo "⚠️ EduHub Database Restore"
echo "Target DB: $DB_NAME"
echo "File: $BACKUP_FILE"
echo "=========================================="

read -p "Are you sure you want to overwrite database $DB_NAME? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
  echo "Restore cancelled."
  exit 0
fi

echo "Restoring database..."
gunzip -c "$BACKUP_FILE" | docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME"

echo "✅ Database restored successfully!"
echo "=========================================="
