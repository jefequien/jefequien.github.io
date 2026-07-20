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

## Deployment

- `main` is the source branch and accepts reviewed website changes.
- GitHub Actions stages only the website files and publishes production to `gh-pages`.
- Pull requests are published beneath `/pr-preview/pr-<number>/` and receive a preview link.
- Preview files are removed automatically when their pull request closes.
- Production deploys preserve the preview directory and rebase instead of force-pushing deployment history.
- Each pull request serializes its own preview updates so deploy and cleanup events stay ordered.

The `gh-pages` branch is deployment output and should not be edited manually.
