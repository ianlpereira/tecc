#!/usr/bin/env bash
# setup.sh — Bootstrap a new client from the financial-control template.
#
# Usage:
#   ./scripts/setup.sh <client-name>
#
# Example:
#   ./scripts/setup.sh acme
#
# This script replaces all tecc placeholders with the given client
# name across every relevant file, then prints next steps.

set -euo pipefail

# ─── Validate argument ───────────────────────────────────────────────────────

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <client-name>"
  echo "Example: $0 acme"
  exit 1
fi

CLIENT_NAME="$1"

if [[ ! "$CLIENT_NAME" =~ ^[a-z0-9][a-z0-9-]*$ ]]; then
  echo "Error: client-name must be lowercase alphanumeric with optional hyphens (e.g. 'acme', 'my-client')."
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  financial-control → setup for: $CLIENT_NAME"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ─── File patterns to process ────────────────────────────────────────────────

FILE_PATTERNS=(
  "*.py"
  "*.ts"
  "*.tsx"
  "*.json"
  "*.yaml"
  "*.yml"
  "*.md"
  "*.html"
  "*.env.example"
  "*.ini"
  "*.sh"
)

# ─── Replace placeholders ────────────────────────────────────────────────────

echo "Replacing tecc → $CLIENT_NAME ..."

for pattern in "${FILE_PATTERNS[@]}"; do
  while IFS= read -r -d '' file; do
    if grep -qF 'tecc' "$file" 2>/dev/null; then
      sed -i "s/tecc/$CLIENT_NAME/g" "$file"
      echo "  ✓  $file"
    fi
  done < <(find "$PROJECT_ROOT" \
    -not -path '*/.git/*' \
    -not -path '*/node_modules/*' \
    -not -path '*/.venv/*' \
    -not -path '*/__pycache__/*' \
    -name "$pattern" \
    -print0)
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Setup complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next steps:"
echo ""
echo "  1. Copy the environment file and set your secrets:"
echo "       cp .env.example .env"
echo "       # Edit .env: set JWT_SECRET_KEY, DEFAULT_ADMIN_PASSWORD, etc."
echo ""
echo "  2. Start the application:"
echo "       docker compose up -d"
echo ""
echo "  3. Run database migrations (first time only):"
echo "       docker compose exec backend alembic upgrade head"
echo ""
echo "  4. Access the app:"
echo "       Frontend: http://localhost:5173"
echo "       API docs: http://localhost:8000/api/docs"
echo ""
echo "  5. Log in with the default admin credentials from your .env"
echo "       (DEFAULT_ADMIN_USERNAME / DEFAULT_ADMIN_PASSWORD)"
echo ""
echo "  6. Before deploying to Render, update CORS_ORIGINS in"
echo "       backend/app/core/config.py with your actual frontend URL."
echo ""
