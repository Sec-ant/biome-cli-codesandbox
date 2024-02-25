import { exit } from "node:process";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const prevReleasesFilePath = fileURLToPath(
  new URL("./releases.json", import.meta.url)
);

const prevReleases = JSON.parse(
  await readFile(prevReleasesFilePath, {
    encoding: "utf-8",
  })
);

let tries = 0;
let resp;

do {
  if (tries > 0) {
    await new Promise((resolve) => setTimeout(() => resolve(), 1000));
  }
  resp = await fetch("https://api.github.com/repos/biomejs/biome/releases");
} while (!resp.ok && tries++ < 5);

if (!resp.ok) {
  exit(1);
}

const currReleases = (await resp.json())
  .filter(({ tag_name }) => tag_name.startsWith("cli/"))
  .sort(
    ({ published_at: t1 }, { published_at: t2 }) => new Date(t1) - new Date(t2)
  )
  .map(({ tag_name, prerelease }) => ({
    tag_name,
    prerelease,
  }));

let newReleases = [];

for (const currRelease of currReleases) {
  if (!prevReleases.some(({ tag_name }) => currRelease.tag_name === tag_name)) {
    newReleases.push({
      tag_name: currRelease.tag_name,
      prerelease: currRelease.prerelease,
    });
  }
}

await writeFile(prevReleasesFilePath, JSON.stringify(currReleases), {
  encoding: "utf-8",
});

console.log(JSON.stringify(newReleases.slice(-256)));
