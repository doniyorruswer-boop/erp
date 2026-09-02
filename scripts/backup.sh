#!/usr/bin/env bash
set -eo pipefail

BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
CONTAINER_NAME="${DB_CONTAINER:-educrm-postgres}"
DB_USER="${DB_USER:-postgres}"
DB_NAME="${DB_NAME:-educrm}"

mkdir -p "$BACKUP_DIR"

echo "=========================================="
echo "📦 EduHub Database Backup Starting..."
echo "Timestamp: $TIMESTAMP"
echo "=========================================="

BACKUP_FILE="$BACKUP_DIR/eduhub_db_${TIMESTAMP}.sql.gz"

# Run pg_dump inside postgres container and compress
if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  docker exec -t "$CONTAINER_NAME" pg_dump -U "$DB_USER" -d "$DB_NAME" | gzip > "$BACKUP_FILE"
  echo "✅ Database backup created: $BACKUP_FILE ($(du -h "$BACKUP_FILE" | cut -f1))"
else
  echo "⚠️ Container $CONTAINER_NAME not found! Attempting direct pg_dump..."
  pg_dump -U "$DB_USER" -d "$DB_NAME" | gzip > "$BACKUP_FILE"
  echo "✅ Local database backup created: $BACKUP_FILE"
fi

# Clean up backups older than 14 days
find "$BACKUP_DIR" -name "eduhub_db_*.sql.gz" -o -name "educrm_db_*.sql.gz" -mtime +14 -delete || true
echo "🧹 Old backups pruned (>14 days)."
echo "=========================================="
