# Jeffrey Hu's Website

Source for [jefequien.github.io](https://jefequien.github.io/), a static academic homepage adapted from [Jon Barron's website](https://github.com/jonbarron/jonbarron_website).

The deployed website is plain HTML and CSS. Development dependencies provide repeatable formatting and validation. Tectonic builds the CV from LaTeX; the website itself has no application build step.

Published website files live in `website/`: `index.html`, `stylesheet.css`, `previews.js`, `images/`, and `data/`. The CV source lives in `cv/`; its generated PDF is written to `website/data/` and is not committed. The repository root contains development configuration and documentation, `scripts/` contains maintenance tools, and `.github/` contains workflows. Run npm commands from the repository root.

## Local development

Use Node.js 24, as specified by `engines.node` in `package.json`, and install the pinned development dependencies. CI reads the same requirement from `package.json`.

```sh
npm install
npx playwright install --with-deps chromium firefox
```

Install Tectonic as described under [CV](#cv), then run `npm run build:cv` to generate the PDF on a fresh checkout.

Start a local server from the repository root:

```sh
python3 -m http.server 8000 --directory website
```

Then open <http://localhost:8000/>.

## Formatting and validation

Format the maintained files:

```sh
npm run format
```

Build the CV and run formatting, HTML, and local-link checks (requires Tectonic):

```sh
npm run check
```

The checks include Chromium and Firefox regression tests, served locally by the test harness. They cover all hover videos, resource cleanup, touch and keyboard controls, reduced motion, failure recovery, responsive overflow, and contribution spacing. Run only these checks with `npm run test:browser`. Playwright is a development dependency; the published site needs no runtime packages.

The Quality workflow runs these checks for pull requests. Pushes to `main` run them once inside the preview workflow, before publishing. Local-link checks verify referenced files and HTML fragment targets.

## CV

Edit `cv/jeffrey_hu_resume.tex`. The two-page CV uses the prose from the previous PDF, with current research, education, and publications added.

Install [Tectonic 0.17.0](https://github.com/tectonic-typesetting/tectonic/releases/tag/tectonic%400.17.0), the version pinned in CI, and ensure `tectonic` is on your `PATH`. Then build:

```sh
npm run build:cv
```

This generates `website/data/jeffrey_hu_resume.pdf`, keeping the site's existing CV URL. The first build downloads the required TeX packages and fonts; subsequent builds use Tectonic's cache. No full TeX Live installation is needed. A failed compilation leaves the previous PDF intact.

`npm run check` rebuilds the CV before validating the site. PR checks, preview deployments, and manual production releases all install Tectonic and run this same command. Review the generated PDF's content and both pages before releasing; edit the LaTeX source rather than the PDF.

## Adding a project

1. Add the project's thumbnail and optional preview video to `website/images/`.
2. Copy an existing `<article class="project">` block in `website/index.html`.
3. Update its heading, description, links, media paths, dimensions, and alt text.
4. Add `data-preview`, a focusable media container, and a `<video>` only when an animated preview exists.
5. Run `npm run format` and `npm run check`.
6. Push to `main`, then use the hosted preview to review desktop and mobile layouts before releasing.

Static thumbnails must communicate the project without requiring hover, video, or JavaScript.

Preview videos use silent H.264 Constrained Baseline, level 3.0, 8-bit `yuv420p` MP4, 24 fps, and `+faststart` (metadata before media data). A silent VP9 WebM source follows MP4 as a fallback for browsers without an H.264 decoder; the browser selects one format. Keep the display aspect ratio and full clip; target at most 480 pixels wide for these small previews. Encode from the best available source with libx264, `-preset slow`, and CRF 26–28, then inspect the result at its displayed size. Avoid repeatedly re-encoding already compressed assets.

Videos have `preload="none"`; JavaScript detaches their sources until a 150 ms hover, keyboard focus, or explicit tap/click. Only one preview may be active. Leaving it, scrolling it out of view, closing Contributions, hiding the page, or enabling reduced motion pauses and unloads it. Re-entry restarts the clip; browsers may reuse their HTTP cache. Touch previews have a play/pause affordance, and Enter/Space toggle playback. Reduced motion keeps static posters and removes the preview controls from keyboard navigation and accessibility semantics. Playback failures retain the poster and allow a fresh attempt on the next interaction.

Paper abstracts must remain verbatim, including any link text within the abstract. Do not shorten, paraphrase, or edit their wording unless explicitly requested. Repository editing guidelines are recorded in `AGENTS.md`.

## Deployment

- `main` is the source branch and accepts direct pushes. PRs are optional; both `main` and `gh-pages` are protected against deletion and force pushes.
- Pushing or merging to `main` runs quality checks but does not release production.
- Production releases are manual: GitHub Actions stages the contents of `website/` and publishes to the root of `gh-pages` after visual approval and passing checks. Public URLs do not include `website/`.
- Each push to `main` updates [the main preview](https://jefequien.github.io/preview/) after checks pass. There are no per-PR previews.
- The preview's [revision.txt](https://jefequien.github.io/preview/revision.txt) identifies its exact source commit. If checks fail, the previous preview remains published.
- Before publishing, the preview workflow checks that its commit still matches `main`, so rerunning an outdated workflow skips deployment.
- Production deploys preserve the preview directory and rebase instead of force-pushing deployment history.
- Preview updates are serialized, and both deployment workflows rebase their writes to preserve concurrent updates to the other site's files.

The `gh-pages` branch is deployment output and should not be edited manually.

For local staging, first run `npm run check` to build the CV, then run `./scripts/stage-site.sh DESTINATION` from the repository root. The destination must be new or empty; the script refuses to overwrite existing files.

### Release production

1. Wait for **Deploy main preview** and GitHub Pages publishing to complete. Visually inspect [the main preview](https://jefequien.github.io/preview/), checking desktop, tablet, and mobile layouts and preview interactions. A local server at the exact source commit is also an option.
2. Copy the full commit SHA from [revision.txt](https://jefequien.github.io/preview/revision.txt) and confirm it stayed the same throughout your inspection (`git rev-parse HEAD` when reviewing locally).
3. In GitHub, open **Actions → Deploy production → Run workflow**, select `main`, and enter the inspected SHA. Providing this SHA confirms your visual approval.
4. The workflow rejects a different branch or SHA, checks out the approved commit, runs `npm run check`, and publishes only if those checks pass. If `main` advanced before you started the workflow, inspect the new commit before retrying.

Visual approval is a human attestation; the workflow cannot verify that an inspection actually took place. Preview updates may still write to `gh-pages`, but only the manual production workflow updates the production files at its root.
