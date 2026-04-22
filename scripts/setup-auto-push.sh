#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${repo_root}"

git config core.hooksPath .githooks
git config push.autoSetupRemote true

echo "Auto-push hooks are enabled for this repository."
if git remote get-url origin >/dev/null 2>&1; then
  echo "origin: $(git remote get-url origin)"
else
  echo "origin is not configured yet. Add it with:"
  echo "  git remote add origin https://github.com/<user>/<repo>.git"
fi
