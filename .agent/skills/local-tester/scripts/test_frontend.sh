#!/bin/bash
set -e

# Ensure we are in the repo root or handle relative paths
REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
cd "$REPO_ROOT/apps/gearpit-web"

echo "=========================================="
echo "🎨 Running Frontend Tests (Next.js)"
echo "=========================================="
echo "Context: Host Machine"

echo ""
echo "▶️  Step 1: Unit Tests (npm test)"
if npm run | grep -q "test"; then
    npm test
else
    echo "⚠️  'npm test' script not found in package.json. Skipping unit tests."
fi

echo ""
echo "▶️  Step 2: E2E Tests (Playwright)"
if [ -f "playwright.config.ts" ] || [ -d "tests" ] || [ -d "e2e" ]; then
    echo "✅ E2E configuration found."
    if npx playwright test; then
        echo "✅ E2E Tests Passed."
    else
        echo "❌ E2E Tests Failed."
        exit 1
    fi
else
    echo "ℹ️  No E2E configuration found (playwright.config.ts, tests/, or e2e/ missing)."
    echo "   Skipping E2E tests as per policy."
    exit 0
fi
