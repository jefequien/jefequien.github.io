import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const scripts = fileURLToPath(new URL("./", import.meta.url));

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), "website-tools-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, "website"));
  mkdirSync(join(root, "scripts"));
  return root;
}

test("local-link validation checks files and HTML fragments", (t) => {
  const root = fixture(t);
  const checker = join(root, "scripts", "check-local-links.mjs");
  cpSync(join(scripts, "check-local-links.mjs"), checker);
  writeFileSync(join(root, "website", "other.html"), '<h1 id="section">Section</h1>');
  writeFileSync(join(root, "website", "paper.pdf"), "PDF fixture");
  for (const [reference, valid] of [
    ["#section", true],
    ["#missing", false],
    ["#comment-only", false],
    ["#legacy", true],
    ["#space%20here", true],
    ["#%ZZ", false],
    ["#top", true],
    ["#", true],
    ["other.html?version=1#section", true],
    ["other.html#missing", false],
    ["/other.html#section", true],
    ["missing.html#section", false],
    ["paper.pdf#page=2", true],
    ["https://example.com/#external", true],
    ["mailto:hello@example.com", true],
  ]) {
    writeFileSync(
      join(root, "website", "index.html"),
      `<h1 id="section">Title</h1><h2 id="space here">Other</h2><a name="legacy"></a>
      <!-- <div id="comment-only"></div> -->
      <a href="${reference}">Link</a>`,
    );
    const result = spawnSync(process.execPath, [checker], { cwd: root, encoding: "utf8" });
    assert.equal(result.status, valid ? 0 : 1, `${reference}: ${result.stderr}`);
  }
});

test("staging copies the site and refuses nonempty destinations without modifying them", (t) => {
  const root = fixture(t);
  writeFileSync(join(root, "website", "index.html"), "site content");
  const destination = join(root, "staged site");
  const stage = () =>
    spawnSync("bash", [join(scripts, "stage-site.sh"), destination], {
      cwd: root,
      encoding: "utf8",
    });
  assert.equal(stage().status, 0);
  assert.equal(readFileSync(join(destination, "index.html"), "utf8"), "site content");
  assert.equal(readFileSync(join(destination, ".nojekyll"), "utf8"), "");
  writeFileSync(join(destination, "obsolete.html"), "keep this");
  writeFileSync(join(root, "website", "index.html"), "new content");
  assert.equal(stage().status, 1);
  assert.equal(readFileSync(join(destination, "index.html"), "utf8"), "site content");
  assert.equal(readFileSync(join(destination, "obsolete.html"), "utf8"), "keep this");
  rmSync(destination, { recursive: true });
  mkdirSync(destination);
  writeFileSync(join(destination, ".hidden"), "keep this too");
  assert.equal(stage().status, 1);
  assert.equal(readFileSync(join(destination, ".hidden"), "utf8"), "keep this too");
});
