#!/usr/bin/env bash

set -euo pipefail

destination="${1:?Usage: scripts/stage-site.sh DESTINATION}"

mkdir -p "${destination}"
cp index.html stylesheet.css "${destination}/"
cp -R images data "${destination}/"
touch "${destination}/.nojekyll"
