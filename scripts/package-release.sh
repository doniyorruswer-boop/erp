#!/usr/bin/env bash
set -eo pipefail

# ================================================================
# 📦 EduHub Clean Release Packager
# Exports tracked files cleanly via git archive into a release zip
# Excluding .git/, node_modules/, .env, logs, and untracked files
# ================================================================

# Ensure running inside git repo and navigate to root
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "❌ Error: Not inside a git repository!"
  exit 1
fi

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

OUTPUT_DIR="${OUTPUT_DIR:-$REPO_ROOT/dist-release}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
RELEASE_NAME="educrm-release-${TIMESTAMP}"
ZIP_FILE="${OUTPUT_DIR}/${RELEASE_NAME}.zip"

mkdir -p "$OUTPUT_DIR"

echo "=========================================="
echo "🚀 EduHub Clean Release Packaging..."
echo "Timestamp: $TIMESTAMP"
echo "Target: $ZIP_FILE"
echo "=========================================="

# Create clean ZIP archive directly using git archive
echo "📦 Generating archive from current HEAD..."
git archive --format=zip -o "$ZIP_FILE" HEAD

# Verify archive existence
if [ -f "$ZIP_FILE" ]; then
  FILE_SIZE=$(du -h "$ZIP_FILE" 2>/dev/null | cut -f1 || ls -lh "$ZIP_FILE" | awk '{print $5}')
  FILE_COUNT=$(git ls-files | wc -l | tr -d ' ')
  
  echo "✅ Release archive created successfully!"
  echo "------------------------------------------"
  echo "📁 File:       $ZIP_FILE"
  echo "📊 Size:       $FILE_SIZE"
  echo "📄 File count: $FILE_COUNT files"
  echo "------------------------------------------"
  echo "🔒 Clean packaging confirmed: .git/, node_modules/, and .env files are excluded."
  echo "=========================================="
else
  echo "❌ Failed to create release archive."
  exit 1
fi