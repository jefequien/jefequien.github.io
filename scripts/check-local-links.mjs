import { existsSync, readFileSync } from "node:fs";

const website = new URL("../website/", import.meta.url);
const html = readFileSync(new URL("index.html", website), "utf8");
const localReferences = [...html.matchAll(/(?:href|src)=["']([^"']+)["']/g)]
  .map((match) => match[1])
  .filter((reference) => {
    return (
      !reference.startsWith("http://") &&
      !reference.startsWith("https://") &&
      !reference.startsWith("mailto:") &&
      !reference.startsWith("#")
    );
  });

const missingReferences = [...new Set(localReferences)].filter(
  (reference) => !existsSync(new URL(reference, website)),
);

if (missingReferences.length > 0) {
  console.error("Missing local references:");
  missingReferences.forEach((reference) => console.error(`- ${reference}`));
  process.exitCode = 1;
} else {
  console.log(`Checked ${new Set(localReferences).size} local references; all exist.`);
}
