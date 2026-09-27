#!/usr/bin/env bash

set -euo pipefail

destination="${1:?Usage: scripts/stage-site.sh DESTINATION}"

mkdir -p "${destination}"
shopt -s nullglob dotglob
existing_files=("${destination}"/*)
if (( ${#existing_files[@]} > 0 )); then
  echo "Staging destination must be empty: ${destination}" >&2
  exit 1
fi

cp -R website/. "${destination}/"
touch "${destination}/.nojekyll"
