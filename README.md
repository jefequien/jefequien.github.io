# Jeffrey Hu's Website

Source for [jefequien.github.io](https://jefequien.github.io/), a static academic homepage adapted from [Jon Barron's website](https://github.com/jonbarron/jonbarron_website).

The deployed website is plain HTML and CSS. Development dependencies are used only for formatting and validation; there is no build step.

## Local preview

Install the development tools:

```sh
npm install
```

Start a local web server from the repository root:

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000/>.

## Formatting and validation

Format the maintained text files:

```sh
npm run format
```

Check formatting and validate the HTML:

```sh
npm run check
```

## Adding a project

1. Add the project's thumbnail and optional preview video to `images/`.
2. Copy an existing `<article class="project">` block in `index.html`.
3. Update its heading, description, links, media paths, dimensions, and alt text.
4. Add `data-preview`, a focusable media container, and a `<video>` only when an animated preview exists.
5. Run `npm run format` and `npm run check`.
6. Preview the page on both desktop and mobile widths before committing.

Static thumbnails must communicate the project without requiring hover, video, or JavaScript.
