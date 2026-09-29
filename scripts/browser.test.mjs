import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve, sep, extname } from "node:path";
import { before, after, test } from "node:test";
import { chromium, firefox } from "playwright";

const root = fileURLToPath(new URL("../website/", import.meta.url));
const types = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};
const server = createServer(async (request, response) => {
  const path = resolve(
    root,
    `.${decodeURIComponent(new URL(request.url, "http://localhost").pathname)}`,
  );
  if (!path.startsWith(root.endsWith(sep) ? root : root + sep) && path !== resolve(root)) {
    response.writeHead(403).end();
    return;
  }
  const file = path === resolve(root) ? resolve(root, "index.html") : path;
  try {
    const data = await readFile(file);
    response.writeHead(200, {
      "Content-Type": types[extname(file)] || "application/octet-stream",
      "Content-Length": data.length,
    });
    response.end(data);
  } catch {
    response.writeHead(404).end();
  }
});
let base;
before(async () => {
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${server.address().port}/`;
});
after(() => new Promise((resolve) => server.close(resolve)));

async function expectPlaying(figure) {
  await figure
    .page()
    .waitForFunction(
      (element) => element.classList.contains("is-previewing"),
      await figure.elementHandle(),
    );
  assert.equal(await figure.getAttribute("aria-pressed"), "true");
}
async function expectUnloaded(page) {
  await page.waitForFunction(() => !document.querySelector("video source"));
}
async function openPage(browser, options = {}) {
  const page = await browser.newPage(options);
  // Fonts and outbound services should not make local regression tests depend on the internet.
  await page.route(/^https:\/\//, (route) => route.abort());
  await page.goto(base);
  return page;
}

for (const browserType of [chromium, firefox]) {
  test(
    `${browserType.name()}: preview layout, loading, controls, and recovery`,
    { timeout: 180000 },
    async (t) => {
      const browser = await browserType.launch();
      t.after(() => browser.close());
      for (const width of [1280, 768, 320]) {
        const page = await openPage(browser, { viewport: { width, height: 900 } });
        const requests = [];
        page.on("request", (request) => {
          if (/\.(mp4|webm)$/.test(request.url())) requests.push(request.url());
        });
        // Reload with request recording to catch accidental eager media downloads.
        await page.reload();
        await page.locator("summary").click();
        await page.waitForTimeout(200);
        assert.equal(requests.length, 0, "opening Contributions must not download videos");
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        const previews = page.locator("[data-preview]");
        assert.equal(await previews.first().evaluate((e) => getComputedStyle(e).cursor), "pointer");
        const staticImage = page.locator(
          ".project-contributions .project-media:not([data-preview])",
        );
        assert.equal(await staticImage.evaluate((e) => getComputedStyle(e).cursor), "auto");
        if (width > 600) {
          for (const selector of [".project-media", ".project-content"]) {
            assert.equal(
              await page
                .locator(`.project-contributions ${selector}`)
                .first()
                .evaluate((e) => getComputedStyle(e).margin),
              "8px 0px",
            );
          }
        }
        for (let round = 0; round < 2; round++) {
          for (let i = 0; i < (await previews.count()); i++) {
            const figure = previews.nth(i);
            await figure.hover();
            await expectPlaying(figure);
            assert.equal(await page.locator("video:has(source)").count(), 1);
            await page.mouse.move(0, 0);
            await expectUnloaded(page);
          }
        }
        const first = previews.first();
        await page.keyboard.press("Tab");
        await first.focus();
        await expectPlaying(first);
        await page.keyboard.press("Escape");
        await expectUnloaded(page);
        await page.keyboard.press("Enter");
        await expectPlaying(first);
        await page.emulateMedia({ reducedMotion: "reduce" });
        await expectUnloaded(page);
        await page.waitForFunction(() =>
          [...document.querySelectorAll("[data-preview]")].every(
            (e) =>
              !e.hasAttribute("role") &&
              !e.hasAttribute("tabindex") &&
              !e.hasAttribute("aria-pressed") &&
              !e.hasAttribute("aria-label"),
          ),
        );
        assert.equal(await first.evaluate((e) => getComputedStyle(e).cursor), "auto");
        const requestCount = requests.length;
        await first.hover();
        await first.click();
        await page.mouse.move(0, 0);
        await page.waitForTimeout(200);
        assert.equal(requests.length, requestCount);
        assert.equal(await first.getAttribute("aria-pressed"), null);
        await page.emulateMedia({ reducedMotion: "no-preference" });
        await page.waitForFunction(
          () => document.querySelector("[data-preview]").getAttribute("role") === "button",
        );
        await first.hover();
        await expectPlaying(first);
        await page.close();
      }
      const touch = await openPage(browser, {
        hasTouch: true,
        viewport: { width: 320, height: 900 },
        reducedMotion: "reduce",
      });
      const figure = touch.locator("[data-preview]").first();
      assert.equal(await figure.getAttribute("role"), null, "initial reduced motion is static too");
      await touch.emulateMedia({ reducedMotion: "no-preference" });
      await touch.waitForFunction(
        () => document.querySelector("[data-preview]").getAttribute("role") === "button",
      );
      await figure.tap();
      await expectPlaying(figure);
      await figure.tap();
      await expectUnloaded(touch);
      await touch.close();

      const page = await openPage(browser);
      const first = page.locator("[data-preview]").first();
      let fail = true;
      await page.route(/\.(mp4|webm)$/, (route) => (fail ? route.abort() : route.continue()));
      await first.hover();
      await page.waitForFunction(() => document.querySelector("video source"));
      await expectUnloaded(page);
      assert.equal(await first.getAttribute("aria-pressed"), "false");
      fail = false;
      await page.mouse.move(0, 0);
      await first.hover();
      await expectPlaying(first);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await expectUnloaded(page);
      await page.locator("summary").click();
      await page.locator("[data-preview]").last().hover();
      await expectPlaying(page.locator("[data-preview]").last());
      await page.locator("summary").click();
      await expectUnloaded(page);
      await page.close();
    },
  );
}
