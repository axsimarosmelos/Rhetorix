import assert from "node:assert/strict";
import { build } from "vite";
import react from "@vitejs/plugin-react";
import { rm } from "node:fs/promises";
await build({
  configFile: false,
  plugins: [react()],
  logLevel: "warn",
  build: {
    ssr: "tests/render-entry.jsx",
    outDir: ".ssr-check",
    emptyOutDir: true,
    rolldownOptions: { output: { entryFileNames: "entry.mjs" } },
  },
});
try {
  const { renderWorkspace, renderExtras } =
    await import("../.ssr-check/entry.mjs");
  const pages = {
    dashboard: "Your next chapter starts here.",
    lexicon: "Give your thoughts better words.",
    phrases: "Find your next line.",
    curriculum: "A stronger voice, by design.",
    arena: "Meet the moment.",
    flashcards: "Make knowledge second nature.",
    progress: "Progress you can build on.",
  };
  for (const [page, title] of Object.entries(pages)) {
    const html = renderWorkspace(page);
    assert.ok(html.includes(title), `${page} has its heading`);
    assert.ok(html.includes("main-content"), `${page} has its main landmark`);
    assert.ok(
      !html.includes("[object Object]"),
      `${page} has no accidental object rendering`,
    );
    console.log(`PASS ${page} server-render`);
  }
  const extras = renderExtras();
  for (const [i, needle] of [
    "YOUR RESOLUTION",
    "The floor is yours.",
    "Cloze deletion",
    "Your target date",
  ].entries()) {
    assert.ok(extras[i].includes(needle));
    console.log(`PASS additional screen: ${needle}`);
  }
} finally {
  await rm(".ssr-check", { recursive: true, force: true });
}
