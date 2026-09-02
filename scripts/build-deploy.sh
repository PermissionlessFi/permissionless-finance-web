#!/bin/bash
# Build and prepare for deployment
set -e

echo "=== Building Permissionless Finance Book ==="

# Ensure we're in the web directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
WEB_DIR="$(dirname "$SCRIPT_DIR")"
cd "$WEB_DIR"

echo "Working directory: $WEB_DIR"

# Step 1: Setup content symlinks
echo ""
echo "--- Setting up content ---"
bash scripts/setup-content.sh

# Step 2: Check environment
echo ""
echo "--- Checking environment ---"
if [ ! -f .env.local ]; then
  echo "WARNING: .env.local not found."
  echo "  AI features will not work without API keys."
  echo "  Create .env.local with:"
  echo "    ANTHROPIC_API_KEY=sk-ant-..."
  echo ""
  read -p "Continue without .env.local? [y/N] " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

NODE_VERSION=$(node -v 2>/dev/null || echo "not found")
echo "Node.js: $NODE_VERSION"

# Step 3: Install dependencies
echo ""
echo "--- Installing dependencies ---"
npm ci

# Step 4: Build
echo ""
echo "--- Building ---"
npm run build

echo ""
echo "=== Build complete ==="
echo ""
echo "To start the production server:"
echo "  cd $WEB_DIR && npm start"
echo ""
echo "Or with PM2 (recommended for production):"
echo "  pm2 start npm --name 'book' -- start"
echo "  pm2 save && pm2 startup"
