import words from "./words.json";
import roots from "./roots.json";
import phrases from "./phrases.json";
import fallacies from "./fallacies.json";
import curriculum from "./curriculum.json";
import techniques from "./techniques.json";
import prompts from "./prompts.json";
import readings from "./readings.json";
export {
  words,
  roots,
  phrases,
  fallacies,
  curriculum,
  techniques,
  prompts,
  readings,
};
const groups = [
  words.map((w) => ({
    id: `word:${w.id}`,
    type: "Vocabulary",
    front: w.word,
    back: w.definition,
    detail: w.example,
    wordId: w.id,
  })),
  roots.map((r) => ({
    id: `root:${r.id}`,
    type: "Roots",
    front: r.root,
    back: r.meaning,
    detail: `${r.origin} · ${r.examples.join(", ")}`,
  })),
  techniques.map((t) => ({
    id: `technique:${t.id}`,
    type: "Techniques",
    front: t.name,
    back: t.definition,
    detail: t.steps.join(" → "),
  })),
];
export const deck = Array.from(
  { length: Math.max(...groups.map((g) => g.length)) },
  (_, i) => groups.map((g) => g[i]).filter(Boolean),
).flat();
export const months = [
  {
    name: "Structural foundations",
    subtitle: "Build your reasoning.",
    description: "Logic, appeals & argument structure",
    color: "sage",
  },
  {
    name: "Refutation & defense",
    subtitle: "Find strength in disagreement.",
    description: "Steel-manning, premises & rebuttals",
    color: "blue",
  },
  {
    name: "Framing & delivery",
    subtitle: "Give your ideas a voice.",
    description: "Language, cadence & vocal control",
    color: "peach",
  },
  {
    name: "Live synthesis",
    subtitle: "Rise to the moment.",
    description: "Cross-examination & rapid response",
    color: "lavender",
  },
];
