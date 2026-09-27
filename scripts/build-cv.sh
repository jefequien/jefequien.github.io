#!/usr/bin/env bash

set -euo pipefail

cd "$(dirname "$0")/.."

if ! command -v tectonic >/dev/null 2>&1; then
  echo "Tectonic is required to build the CV. See README.md for installation." >&2
  exit 1
fi

cv_build_dir="$(mktemp -d)"
trap 'rm -rf "$cv_build_dir"' EXIT

tectonic --untrusted --outdir "$cv_build_dir" cv/jeffrey_hu_resume.tex
mkdir -p website/data
cp "$cv_build_dir/jeffrey_hu_resume.pdf" website/data/jeffrey_hu_resume.pdf
