# Website editing guidelines

- Paper abstracts must be reproduced verbatim. Do not shorten, paraphrase, or polish their wording, including link text within an abstract, unless the user explicitly requests it. HTML formatting may change without changing the rendered text.
- Label publication links as `paper`, preferring the arXiv abstract (`/abs/`) URL when available. Otherwise, use the PDF linked from the official project page. Do not add a separate `arXiv` link.
- Keep the site as plain HTML, CSS, and minimal JavaScript, with no application build step or runtime dependencies.
- Maintain the CV in `cv/jeffrey_hu_resume.tex` and build it with Tectonic via `npm run build:cv`. Its generated PDF is ignored by Git and rebuilt by `npm run check` before deployment. Aim for two pages; verify the rendered PDF after content or style changes. Do not invent employment or education dates.
- Keep all published website source files in `website/` (the LaTeX CV source lives in `cv/`). Tooling, configuration, and repository documentation belong outside it. Deployment copies the contents of `website/` to the published root, so public URLs do not include `website/`.
- Preserve the existing minimal academic layout and project ordering unless requested otherwise.
- Production releases must be manual and follow visual inspection of the exact source commit. Pushing to `main` must not automatically release production; `gh-pages` is deployment output.
- Direct pushes to `main` are the normal workflow. They publish only the shared `/preview/` site after checks pass; do not add per-PR previews. Production deployment must preserve `/preview/`.
- Run `npm run check` after changes. For layout or preview changes, also verify desktop, tablet, and 320px mobile layouts, keyboard and pointer interaction, touch behavior, and reduced motion.
