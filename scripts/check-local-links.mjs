import { existsSync, readFileSync } from "node:fs";

const website = new URL("../website/", import.meta.url);
const index = new URL("index.html", website);
const readHtml = (url) => readFileSync(url, "utf8").replace(/<!--[\s\S]*?-->/g, "");
const html = readHtml(index);
const localReferences = [...html.matchAll(/\b(?:href|src)=["']([^"']+)["']/g)]
  .map((match) => match[1])
  .filter((reference) => !/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(reference));

const missingReferences = [...new Set(localReferences)].filter((reference) => {
  const target = new URL(reference, index);
  if (reference.startsWith("/")) {
    target.pathname = new URL(reference.slice(1), website).pathname;
  }
  if (!existsSync(target)) return true;

  // PDF fragments (such as #page=2) are interpreted by the viewer, not HTML IDs.
  if (!target.hash || !/\.html?$/i.test(target.pathname)) return false;

  let fragment;
  try {
    fragment = decodeURIComponent(target.hash.slice(1).split(":~:")[0]);
  } catch {
    return true;
  }
  if (!fragment) return false;

  const targetHtml = readHtml(target);
  const ids = [...targetHtml.matchAll(/\bid=["']([^"']+)["']/g)].map((match) => match[1]);
  const namedAnchors = [...targetHtml.matchAll(/<a\b[^>]*\bname=["']([^"']+)["']/gi)].map(
    (match) => match[1],
  );
  return (
    !ids.includes(fragment) && !namedAnchors.includes(fragment) && fragment.toLowerCase() !== "top"
  );
});

if (missingReferences.length > 0) {
  console.error("Missing local references:");
  missingReferences.forEach((reference) => console.error(`- ${reference}`));
  process.exitCode = 1;
} else {
  console.log(`Checked ${new Set(localReferences).size} local references; all exist.`);
}
