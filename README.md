# Jeffrey Hu's Website

Source for [jefequien.github.io](https://jefequien.github.io/), a static academic homepage adapted from [Jon Barron's website](https://github.com/jonbarron/jonbarron_website).

The deployed website is plain HTML and CSS. Development dependencies provide repeatable formatting and validation; there is no application build step.

All published source files live in `website/`: `index.html`, `stylesheet.css`, `images/`, and `data/`. The repository root contains development configuration and documentation, `scripts/` contains maintenance tools, and `.github/` contains workflows. Run npm commands from the repository root.

## Local development

Use Node.js 24 and install the pinned development dependencies:

```sh
npm install
```

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

Run formatting, HTML, and local-link checks:

```sh
npm run check
```

The Quality workflow runs these checks for pull requests. Pushes to `main` run them once inside the preview workflow, before publishing. Local-link checks verify referenced files and HTML fragment targets.

## Adding a project

1. Add the project's thumbnail and optional preview video to `website/images/`.
2. Copy an existing `<article class="project">` block in `website/index.html`.
3. Update its heading, description, links, media paths, dimensions, and alt text.
4. Add `data-preview`, a focusable media container, and a `<video>` only when an animated preview exists.
5. Run `npm run format` and `npm run check`.
6. Push to `main`, then use the hosted preview to review desktop and mobile layouts before releasing.

Static thumbnails must communicate the project without requiring hover, video, or JavaScript.

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

For local staging, run `./scripts/stage-site.sh DESTINATION` from the repository root. The destination must be new or empty; the script refuses to overwrite existing files.

### Release production

1. Wait for **Deploy main preview** and GitHub Pages publishing to complete. Visually inspect [the main preview](https://jefequien.github.io/preview/), checking desktop, tablet, and mobile layouts and preview interactions. A local server at the exact source commit is also an option.
2. Copy the full commit SHA from [revision.txt](https://jefequien.github.io/preview/revision.txt) and confirm it stayed the same throughout your inspection (`git rev-parse HEAD` when reviewing locally).
3. In GitHub, open **Actions → Deploy production → Run workflow**, select `main`, and enter the inspected SHA. Providing this SHA confirms your visual approval.
4. The workflow rejects a different branch or SHA, checks out the approved commit, runs `npm run check`, and publishes only if those checks pass. If `main` advanced before you started the workflow, inspect the new commit before retrying.

Visual approval is a human attestation; the workflow cannot verify that an inspection actually took place. Preview updates may still write to `gh-pages`, but only the manual production workflow updates the production files at its root.
