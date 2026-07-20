# Website Improvement Plan

## Direction

Keep `index.html` as the source of truth. The website will remain a simple, static GitHub Pages site with no framework, content layer, generator, runtime package dependencies, or build step.

The goal is to make small, reviewable improvements while preserving the current Jon Barron-style appearance, content, URLs, and ordering.

Development-only tools are allowed for repeatable formatting and validation. They must not add a build step or any dependency to the deployed website.

## 0. Add Development Tooling

- [x] Add a pinned local version of Prettier for HTML, CSS, and Markdown formatting.
- [x] Add EditorConfig settings for consistent indentation, line endings, and final newlines.
- [x] Add `html-validate` with its recommended and Prettier-compatible presets.
- [x] Provide `format`, `format:check`, `validate`, and combined `check` npm scripts.
- [x] Exclude development dependencies from version control.

### Acceptance criteria

- `npm run format` formats the maintained text files.
- `npm run check` detects formatting and HTML structural problems.
- Tooling has no effect on the website's runtime or direct GitHub Pages deployment.

## 1. Stabilize the HTML

- [x] Correct malformed, incorrectly nested, and unclosed elements.
- [x] Replace layout tables with semantic containers where doing so does not alter the appearance.
- [x] Move repeated inline styles into clearly named CSS classes.
- [x] Establish one consistent `<article class="project">` structure for research entries and contributions.
- [x] Preserve all existing content, URLs, media, and visual ordering during the refactor.

### Acceptance criteria

- The page passes HTML validation without structural errors.
- The desktop layout remains visually consistent with the current site.
- A new project can be added by copying and editing one predictable HTML block.

## 2. Simplify Project Previews

- [x] Replace the repeated per-project inline scripts with one shared script.
- [x] Show preview video on pointer hover and keyboard focus.
- [x] Keep the static thumbnail visible as the touch-device and reduced-motion fallback.
- [x] Add `playsinline` and appropriate preload behavior to preview videos.
- [x] Ensure a missing or failed video never hides the static thumbnail.

### Acceptance criteria

- No project-specific JavaScript functions are required.
- Preview interactions work with a pointer and keyboard.
- Every project remains understandable without video or JavaScript.

## 3. Add Modest Responsive Behavior

- [x] Retain the centered, approximately 800px-wide desktop layout.
- [x] Stack the profile image and biography gracefully on narrow screens.
- [x] Stack or resize project media and text where necessary.
- [x] Prevent horizontal scrolling at small viewport widths.
- [x] Improve spacing and link tap targets on phones.

### Acceptance criteria

- No horizontal scrolling occurs at 320 CSS pixels wide.
- The page remains readable and balanced on phone, tablet, and desktop layouts.
- Desktop presentation retains the existing minimal visual character.

## 4. Address Basic Accessibility

- [x] Use the name as the page's single `h1`.
- [x] Apply a consistent `h2` and `h3` heading hierarchy.
- [x] Add meaningful alt text to the headshot and research media.
- [x] Add clear keyboard focus styles.
- [x] Remove the global new-tab behavior and apply it only where useful.
- [x] Add safe `rel="noopener noreferrer"` attributes to links that open new tabs.
- [x] Respect `prefers-reduced-motion` for animated previews.
- [x] Verify text, link, hover, and focus color contrast.

### Acceptance criteria

- All content and links are usable with a keyboard.
- The heading hierarchy accurately describes the page.
- Touch and reduced-motion users receive a complete experience without hover video.

## 5. Make Lightweight Performance Improvements

- [x] Resize and compress the oversized headshot for its displayed dimensions.
- [x] Add explicit image dimensions to reduce layout movement.
- [x] Lazy-load below-the-fold images.
- [x] Avoid loading every preview video during the initial page load.
- [x] Retain original assets until optimized replacements have been visually verified.

### Acceptance criteria

- Below-the-fold videos are not fetched during the initial page load.
- The page has minimal layout shift.
- Optimized media has no noticeable loss of visual quality at its displayed size.

## 6. Polish Metadata and Maintenance

- [x] Add a concise meta description and canonical URL.
- [x] Add Open Graph and social preview metadata with an appropriately sized image.
- [x] Replace the attribution's “stolen from” wording with neutral language.
- [x] Expand `README.md` with local preview and project-entry instructions.
- [x] Remove unused files only after confirming they have no purpose.

### Acceptance criteria

- Shared links produce a useful title, description, and preview image.
- The README explains how to preview the site and add a project.
- No file is removed without first verifying that it is unused.

## Verification

After each stage:

- [ ] Compare desktop screenshots against the existing site.
- [ ] Test at 320px, tablet, and desktop viewport widths.
- [ ] Test keyboard, pointer, and touch interaction where applicable.
- [x] Validate the HTML.
- [x] Check local assets and internal links.
- [x] Run `git diff --check`.

## Implementation Order

Begin with development tooling, then stabilize the HTML and consolidate project-preview behavior while intentionally retaining the current appearance. Responsive behavior, accessibility, performance, and metadata follow as separate, reviewable changes.

## Out of Scope

- Converting the content to Markdown or JSON.
- Adding a static-site generator or custom templating system.
- Adding a website build step or runtime dependency. Development-only formatting and validation tools are permitted.
- Migrating to React, Next.js, or another application framework.
- Adding a CMS, database, or client-side rendering layer.
- Broadly redesigning the site's visual identity.
- Adding analytics without a specific measurement goal and a privacy-conscious tool.
