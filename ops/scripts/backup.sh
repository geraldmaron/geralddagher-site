#!/bin/bash
set -e

# Configuration
BACKUP_DIR="/opt/cms-v2/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="directus_backup_${TIMESTAMP}.sql.gz"
RETENTION_DAYS=30
CONTAINER_NAME="directus-cms-database-1" # Verify with docker ps
DB_USER="directus"

# Create backup dir
mkdir -p "$BACKUP_DIR"

# 1. Dump Database
echo "Starting backup: $FILENAME"
docker exec -t $CONTAINER_NAME pg_dump -U $DB_USER directus | gzip > "$BACKUP_DIR/$FILENAME"

# 2. Upload to R2 (Requires rclone configured or AWS CLI)
# Assuming rclone is installed and configured as 'r2' remote
# rclone copy "$BACKUP_DIR/$FILENAME" r2:my-backup-bucket/cms-backups/

# 3. Cleanup local old backups
find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: $BACKUP_DIR/$FILENAME"
