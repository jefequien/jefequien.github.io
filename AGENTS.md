# Website editing guidelines

- Paper abstracts must be reproduced verbatim. Do not shorten, paraphrase, or polish their wording, including link text within an abstract, unless the user explicitly requests it. HTML formatting may change without changing the rendered text.
- Label publication links to arXiv as `paper`; do not add a separate `arXiv` link. If no arXiv entry is verified, omit the paper link rather than substituting another destination.
- Keep the site as plain HTML, CSS, and minimal JavaScript, with no application build step or runtime dependencies.
- Keep all published source files in `website/`. Tooling, configuration, and repository documentation belong outside it. Deployment copies the contents of `website/` to the published root, so public URLs do not include `website/`.
- Preserve the existing minimal academic layout and project ordering unless requested otherwise.
- Production releases must be manual and follow visual inspection of the exact source commit. Pushing to `main` must not automatically release production; `gh-pages` is deployment output.
- Direct pushes to `main` are the normal workflow. They publish only the shared `/preview/` site after checks pass; do not add per-PR previews. Production deployment must preserve `/preview/`.
- Run `npm run check` after changes. For layout or preview changes, also verify desktop, tablet, and 320px mobile layouts, keyboard and pointer interaction, touch behavior, and reduced motion.
