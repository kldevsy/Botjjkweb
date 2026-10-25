#!/usr/bin/env bash
set -euo pipefail

python -m pip install --no-cache-dir -r backend/requirements.txt nodeenv

nodeenv --node=20.19.0 /tmp/discloud-node
export PATH="/tmp/discloud-node/bin:$PATH"

npm install --global yarn@1.22.22
yarn --cwd frontend install --frozen-lockfile
REACT_APP_BACKEND_URL="" yarn --cwd frontend build
