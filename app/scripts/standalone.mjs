import { readFile, writeFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
// Run after `npm run build`. The preview contains all code and styling inline.
const dir = resolve("dist");
const files = await readdir(resolve(dir, "assets"));
const js = files.filter((f) => f.endsWith(".js"));
const css = files.filter((f) => f.endsWith(".css"));
if (js.length !== 1 || css.length !== 1)
  throw new Error(
    "Expected one JS bundle and one stylesheet. Update this packager if adding code splitting.",
  );
const script = (await readFile(resolve(dir, "assets", js[0]), "utf8")).replace(
  /<\/script/gi,
  "<\\/script",
);
const style = (await readFile(resolve(dir, "assets", css[0]), "utf8")).replace(
  /<\/style/gi,
  "<\\/style",
);
let html = await readFile(resolve(dir, "index.html"), "utf8");
html = html
  .replace(/<script\b[^>]*src=[^>]*><\/script>/g, "")
  .replace(/<link\b[^>]*rel="stylesheet"[^>]*>/g, "");
html = html
  .replace("</head>", () => `<style>${style}</style></head>`)
  .replace("</body>", () => `<script type="module">${script}</script></body>`);
const target = resolve("Rhetorix-Preview.html");
await writeFile(target, html);
console.log(`Created ${target}`);
