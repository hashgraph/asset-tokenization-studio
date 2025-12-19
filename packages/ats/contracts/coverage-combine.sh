#!/usr/bin/env bash
set -euo pipefail

# Directory where the script is executed
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Monorepo root
ROOT_DIR="$(git rev-parse --show-toplevel)"
cd "$ROOT_DIR"

WORKSPACE="packages/ats/contracts"
WORKSPACE_COVERAGE="$WORKSPACE/coverage"

CACHE_DIR="$ROOT_DIR/coverage-cache"
FINAL_COVERAGE_DIR="$SCRIPT_DIR/coverage"

declare -A TESTS=(
  ["layer_1"]="layer1"
  ["factory"]="factory"
  ["resolver"]="resolver"
  ["resolverProxy"]="resolverProxy"
)

for DIR in "${!TESTS[@]}"; do
  CACHE_SUBDIR="$CACHE_DIR/${TESTS[$DIR]}"
  echo "Running coverage for $DIR ..."

  mkdir -p "$CACHE_SUBDIR"

  NODE_OPTIONS="--max-old-space-size=8192" \
    npm exec --workspace "$WORKSPACE" -- \
      hardhat coverage \
        --testfiles "test/contracts/unit/$DIR/**/*.ts"

  # Move lcov from workspace
  mv "$ROOT_DIR/$WORKSPACE_COVERAGE/coverage-final.json" "$CACHE_SUBDIR/lcov.json"

  # Move HTML from workspace
  mkdir -p "$CACHE_SUBDIR/html"
  mv "$ROOT_DIR/$WORKSPACE_COVERAGE"/* "$CACHE_SUBDIR/html/" || true

  echo "Coverage for $DIR completed."
done

# Combine lcovs in root
cd "$ROOT_DIR"
npm exec --workspace "$WORKSPACE" -- \
  istanbul-combine-updated \
    -d "$FINAL_COVERAGE_DIR" \
    -p summary \
    -r lcov \
    -r html \
    -b "$ROOT_DIR/$WORKSPACE" \
    "$CACHE_DIR/factory/lcov.json" \
    "$CACHE_DIR/layer1/lcov.json" \
    "$CACHE_DIR/resolverProxy/lcov.json" \
    "$CACHE_DIR/resolver/lcov.json"

echo "Combined coverage generated at $FINAL_COVERAGE_DIR"

# Clean temporary directory
echo "Cleaning temporary directory..."
rm -rf "$CACHE_DIR"
echo "✓ Directory $CACHE_DIR deleted"
