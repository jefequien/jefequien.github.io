# Jeffrey Hu's Website

Source for [jefequien.github.io](https://jefequien.github.io/), a static academic homepage adapted from [Jon Barron's website](https://github.com/jonbarron/jonbarron_website).

The deployed website is plain HTML and CSS. Development dependencies provide repeatable formatting and validation; there is no application build step.

## Local development

Use Node.js 24 and install the pinned development dependencies:

```sh
npm install
```

Start a local server from the repository root:

```sh
python3 -m http.server 8000
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

The quality workflow runs the same checks for pull requests and pushes to `main`.

## Adding a project

1. Add the project's thumbnail and optional preview video to `images/`.
2. Copy an existing `<article class="project">` block in `index.html`.
3. Update its heading, description, links, media paths, dimensions, and alt text.
4. Add `data-preview`, a focusable media container, and a `<video>` only when an animated preview exists.
5. Run `npm run format` and `npm run check`.
6. Use the pull request's hosted preview to review desktop and mobile layouts before merging.

Static thumbnails must communicate the project without requiring hover, video, or JavaScript.

Paper abstracts must remain verbatim, including any link text within the abstract. Do not shorten, paraphrase, or edit their wording unless explicitly requested. Repository editing guidelines are recorded in `AGENTS.md`.

## Deployment

- `main` is the source branch and accepts reviewed website changes.
- Pushing or merging to `main` runs quality checks but does not release production.
- Production releases are manual: GitHub Actions stages only the website files and publishes to `gh-pages` after visual approval and passing checks.
- Pull requests are published beneath `/pr-preview/pr-<number>/` and receive a preview link.
- Preview files are removed automatically when their pull request closes.
- Production deploys preserve the preview directory and rebase instead of force-pushing deployment history.
- Each pull request serializes its own preview updates so deploy and cleanup events stay ordered.

The `gh-pages` branch is deployment output and should not be edited manually.

### Release production

1. Visually inspect the exact `main` commit you intend to release using a local server. Check desktop, tablet, and mobile layouts and preview interactions. PR previews are also available before merging; recheck the final merged commit if its content differs.
2. Copy its full commit SHA (`git rev-parse HEAD` from that checkout).
3. In GitHub, open **Actions → Deploy production → Run workflow**, select `main`, and enter the inspected SHA. Providing this SHA confirms your visual approval.
4. The workflow rejects a different branch or SHA, checks out the approved commit, runs `npm run check`, and publishes only if those checks pass. If `main` advanced before you started the workflow, inspect the new commit before retrying.

Visual approval is a human attestation; the workflow cannot verify that an inspection actually took place. Preview updates may still write to `gh-pages`, but only the manual production workflow updates the production files at its root.
