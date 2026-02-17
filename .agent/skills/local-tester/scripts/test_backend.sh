#!/bin/bash
set -e

# Ensure we are in the repo root or handle relative paths
REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
cd "$REPO_ROOT/apps/gearpit-core"

echo "=========================================="
echo "🛡️  Running Backend Domain Tests (Go)"
echo "=========================================="
echo "Context: Host Machine (No Docker)"
echo "Target: ./internal/domain/..."

if [ ! -d "internal/domain" ]; then
    echo "❌ Error: internal/domain directory not found."
    exit 1
fi

go test -v ./internal/domain/...
