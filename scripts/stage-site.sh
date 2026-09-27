#!/usr/bin/env bash

set -euo pipefail

destination="${1:?Usage: scripts/stage-site.sh DESTINATION}"

mkdir -p "${destination}"
cp -R website/. "${destination}/"
touch "${destination}/.nojekyll"
