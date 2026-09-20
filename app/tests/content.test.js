import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = (name) =>
  JSON.parse(
    readFileSync(new URL(`../src/data/${name}.json`, import.meta.url)),
  );
test("16 sequential weeks have objectives, lessons, practice, and linked readings", () => {
  const modules = read("curriculum");
  const readings = read("readings");
  assert.equal(modules.length, 16);
  modules.forEach((m, i) => {
    assert.equal(m.week, i + 1);
    assert.equal(m.month, Math.floor(i / 4) + 1);
    assert.ok(
      m.objectives.length &&
        m.lesson.length &&
        m.practice.length &&
        m.assessment,
    );
    assert.ok(readings.some((r) => r.id === m.readingId));
  });
});
test("word and root references, cloze slots, and all dataset IDs are sound", () => {
  const roots = read("roots");
  const words = read("words");
  for (const w of words) {
    assert.ok(
      roots.some((r) => r.id === w.rootId),
      w.word,
    );
    assert.equal((w.cloze.match(/_____/g) || []).length, 1);
    assert.ok(w.prefix && w.base.text && w.suffix && w.definition && w.note);
  }
  for (const name of [
    "words",
    "roots",
    "phrases",
    "fallacies",
    "curriculum",
    "techniques",
    "prompts",
  ]) {
    const rows = read(name);
    assert.equal(
      new Set(rows.map((r) => r.id)).size,
      rows.length,
      `${name} IDs must be unique`,
    );
  }
});
