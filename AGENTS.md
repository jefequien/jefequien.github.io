# Website editing guidelines

- Paper abstracts must be reproduced verbatim. Do not shorten, paraphrase, or polish their wording, including link text within an abstract, unless the user explicitly requests it. HTML formatting may change without changing the rendered text.
- Keep the site as plain HTML, CSS, and minimal JavaScript, with no application build step or runtime dependencies.
- Preserve the existing minimal academic layout and project ordering unless requested otherwise.
- Production releases must be manual and follow visual inspection of the exact source commit. Pushing to `main` must not automatically release production; `gh-pages` is deployment output.
- Run `npm run check` after changes. For layout or preview changes, also verify desktop, tablet, and 320px mobile layouts, keyboard and pointer interaction, touch behavior, and reduced motion.
