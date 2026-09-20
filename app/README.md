# Rhetorix

A responsive, local-first speaking studio for a four-month training deadline. React 19, Vite 8, Tailwind CSS 4 through PostCSS, and Lucide icons. No sign-in or external service is needed for the built-in exercises and mock opponent.

## Run the included application

Use Node.js **22.12 or newer**. Extract the archive, then run:

```bash
cd rhetorix
npm ci
npm run dev
```

Open the local address printed by Vite, normally `http://127.0.0.1:5173`. To expose the development server to another device on your network, use `npm run dev -- --host 0.0.0.0`.

```bash
npm test                 # Scheduler, dates, validation, dataset integrity, API adapter
npm run test:render      # Server-render smoke check of every workspace
npm run build            # Production files in dist/
npm run preview          # Preview the production build locally
npm run standalone       # After build: creates Rhetorix-Preview.html
npm run format           # Format the project source
```

`Rhetorix-Preview.html` is a self-contained preview with React, datasets, icons, and styling embedded. Open it in a modern browser. Browser restrictions can disable local storage for file URLs or embedded previews; the app then shows a storage notice and can export the current session. Running through Vite is the recommended way to use it regularly. The preview and a hosted app have separate storage origins; use backup export/import to transfer progress.

## Initialize the stack from scratch

These are the complete terminal initialization commands. The included source files and configuration replace the scaffold defaults.

```bash
npm create vite@latest rhetorix -- --template react
cd rhetorix
npm install react@19.2.8 react-dom@19.2.8 lucide-react@1.31.0
npm install -D vite@8.2.1 @vitejs/plugin-react@6.0.5
npm install -D tailwindcss@4.2.1 @tailwindcss/postcss@4.2.1 postcss@8.5.26
npm install -D prettier@3.9.6
```

Add `postcss.config.js`:

```js
export default {
  plugins: { "@tailwindcss/postcss": {} },
};
```

Add `vite.config.js`:

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./",
  server: {
    proxy: {
      "/api": { target: "http://127.0.0.1:8787", changeOrigin: true },
    },
  },
  build: { target: "es2022" },
});
```

The first line of `src/styles.css` imports Tailwind:

```css
@import "tailwindcss";
```

`src/main.jsx` imports that stylesheet and wraps the app in `AppProvider`. After copying the included source, run `npm run dev`.

The configuration follows the official [Vite guide](https://vite.dev/guide/) and [Tailwind PostCSS installation guide](https://tailwindcss.com/docs/installation/using-postcss). The archive has a lockfile for the tested versions above.

## Modular architecture

| File / directory                     | Responsibility                                                                |
| ------------------------------------ | ----------------------------------------------------------------------------- |
| `src/App.jsx`                        | Responsive shell, navigation, hash routes, countdown, global feedback         |
| `src/components/Dashboard.jsx`       | Daily plan, real activity metrics, word of the day, next lesson               |
| `src/components/LexiconExplorer.jsx` | Searchable words, root/base/affix breakdowns, learned words, pronunciation    |
| `src/components/Phrasebook.jsx`      | Rhetorical transitions, concessions, reframing, cadence, saved phrases        |
| `src/components/DrillSystem.jsx`     | Cloze deletion, root decoding, tone matching, timed speed recall              |
| `src/components/CurriculumMap.jsx`   | Four monthly modules, 16 weekly lessons, reading lenses, notes, checkpoints   |
| `src/components/DebateArena.jsx`     | Fallacy Spotter, Thesis Defense, and Mock Debate                              |
| `src/components/FlashcardEngine.jsx` | Due/new queues, recall reveal, self-rating, scheduling                        |
| `src/components/Progress.jsx`        | Quiz results, 14-day activity, streaks, review intervals, recent work         |
| `src/components/Settings.jsx`        | Target date, daily goal, API settings, backup export/import, explicit reset   |
| `src/components/UI.jsx`              | Shared buttons, dialogs, headings, tabs, feedback primitives                  |
| `src/context/AppContext.jsx`         | Versioned local storage and progress mutations                                |
| `src/lib/engine.js`                  | Pure date, streak, scheduling, queue, word-matching, and validation functions |
| `src/lib/useCountdown.js`            | Deadline-based timer; catches up after background-tab throttling              |
| `src/lib/debate.js`                  | Opponent prompt builder and cancellable API / local mock adapter              |
| `src/data/*.json`                    | Editable educational starter datasets                                         |
| `server/example.mjs`                 | Optional local bridge to a custom LLM gateway                                 |
| `tests/`                             | Logic and data tests plus render smoke tests                                  |

## Educational content

The starter pack contains **32 words, 20 roots, 24 phrases, 12 fallacies, 8 techniques, 8 debate prompts, 3 reading overviews, and 16 weekly modules**. It is a curated starting point for expansion, not an exhaustive four-month vocabulary bank.

| Dataset           | Core fields                                                                                                                         |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `words.json`      | `id`, `word`, `definition`, `prefix`, `base`, `suffix`, `rootId`, `example`, `cloze`, `category`, `note`                            |
| `roots.json`      | `id`, `root`, `meaning`, `origin`, `examples`                                                                                       |
| `phrases.json`    | `id`, `category`, `text`, `tone`, `usage`                                                                                           |
| `fallacies.json`  | `id`, `name`, `definition`, `argument`, `weakness`, `refutation`                                                                    |
| `techniques.json` | `id`, `name`, `definition`, `steps`                                                                                                 |
| `curriculum.json` | `id`, `week`, `month`, `title`, `focus`, `readingId`, `readingFocus`, `objectives`, `lesson`, `practice`, `assessment`, `dailyPlan` |
| `prompts.json`    | `id`, `text`, `framework`                                                                                                           |
| `readings.json`   | `id`, `title`, `author`, `summary`, `url`                                                                                           |

Word decompositions are teaching aids. Bound stems are identified as such, missing affixes are shown as ∅, and spelling variants are noted. The full definition governs modern usage; a root does not guarantee a word’s current meaning. For example, `in- + explic + -able` is a teaching split for _inexplicable_, and the base continues the idea of unfolding or explaining. Morphology and historical etymology are related but not interchangeable.

### The 16-week sequence

| Month                                 | Weeks and focus                                                                                                      |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| 1 · Structural foundations and logic  | 1: appeals; 2: Toulmin; 3: fallacies; 4: PREP and a foundation checkpoint                                            |
| 2 · Refutation and strategic defense  | 5: steel-manning; 6: concessions; 7: premises and evidence; 8: structured rebuttal                                   |
| 3 · Framing, lexicon, and delivery    | 9: frames and loaded language; 10: morphology and active vocabulary; 11: cadence and pauses; 12: tone under pressure |
| 4 · Live synthesis and rapid response | 13: cross-examination; 14: impromptu speaking; 15: closing arguments; 16: a complete debate and reflection           |

The suggested rhythm is 45 minutes per practice day, five days per week: 10 minutes of review, 10 of reading, 15 of focused exercises, and 10 of spoken application. Weekend catch-up and review are flexible. All weeks are accessible, so a learner can move faster or revisit a foundation. Changing the daily goal changes the tracking target, not the authored lesson plan.

The lesson explanations, exercises, examples, and weekly reading lenses are original. They are not chapter-by-chapter book summaries. Concise reading overviews are included and linked to:

- Jay Heinrichs, [_Thank You for Arguing_](https://www.penguinrandomhouse.com/books/646966/thank-you-for-arguing-fourth-edition-revised-and-updated-by-jay-heinrichs/): everyday persuasion and classical rhetorical ideas.
- Arthur Schopenhauer, [_The Art of Controversy_ / _The Art of Being Right_](https://www.gutenberg.org/ebooks/10731): disputation tactics, studied to recognize and counter them rather than equating victory with truth.
- Madsen Pirie, [_How to Win Every Argument_](https://www.bloomsbury.com/us/how-to-win-every-argument-9781350405011/): patterns of faulty reasoning.

Chapter numbers vary by edition. The app points to themes and public book details; it does not reproduce copyrighted chapters.

## How practice and progress work

- **Learning words:** “Add to learned words” marks a word as studied. Reviewing a vocabulary card also adds it. Recognition is not described as mastery.
- **Drills:** Five randomized questions per completed session. Typed answers are case-insensitive and accept trailing punctuation. Root and tone drills use multiple choice. Tone has a stated intended reading; real delivery can change it.
- **Speed recall:** Choose 10, 20, 30, or 60 seconds per word. Expired questions are incorrect, and the correct answer is shown before continuing. Exiting an unfinished drill does not record a quiz score.
- **Fallacy Spotter:** Choose a 60–300 second round, identify the flaw, and write four refutation moves. The fallacy is checked against the dataset. The learner compares their reasoning with the model response.
- **Thesis Defense:** Learn three target words, choose a side and Toulmin or PREP, then fill every framework move using all three words. The check uses whole-word matching and verifies structural presence. On timeout, the partial draft receives feedback, even if incomplete.
- **Mock Debate:** The offline mock uses rotating critical-thinking prompts and quotes part of the last user message. It is not an LLM and does not fact-check or assess argumentative validity. Use “Save practice” after an exchange to log the session. “New debate” saves completed exchanges before clearing the visible chat. Transcripts can be downloaded.
- **Flashcards:** A session has up to 10 cards, prioritizing overdue items then unseen material. Vocabulary, roots, and debate techniques are interleaved. “Again” returns in 10 minutes; “Hard” starts at one day; “Good” starts at one day, then three days, then multiplies by ease; “Easy” starts at four days. Ease stays between 1.3 and 3.0, and intervals are capped at 3,650 days. This is a transparent SM-2-inspired heuristic, not the exact SM-2 algorithm or a calibrated retention model.
- **Streaks:** Activity on consecutive local calendar days counts. Yesterday’s streak remains active until today passes without practice. Importing a backup preserves its original daily records.
- **Deadline:** The default is four calendar months after first use, with month-end clamping. The 16-week curriculum is 112 days; four calendar months is usually longer. The additional time is useful for catch-up and final rehearsal. The deadline can be edited.
- **Analytics:** Quiz average includes completed lexicon drills only. Timed practice sums time inside rated flashcards, completed drills, submitted arena rounds, and explicitly saved mock debates. It excludes untracked reading and offline speaking. An interval of 21 days is a scheduling milestone, not a claim of mastery.

Speech playback uses the browser’s `speechSynthesis` feature and installed voices when available. There is no microphone recording or automatic vocal scoring. The lessons explicitly guide spoken practice, cadence, and pause review.

## Local persistence and backups

State is saved as version 1 under the `rhetorix.v1` local-storage key. It includes the start/target dates, settings, learned words, phrase bookmarks, weekly completion, lesson notes, card schedules, and up to 10,000 recent activity events. Chat content and active exercise drafts are session-only; download the transcript if needed.

Settings contains JSON export/import. Imports validate dates, data shapes, scheduling bounds, scores, and the same-origin API path before asking to replace progress. Invalid local data is preserved rather than silently overwritten; the app runs a temporary session and explains how to recover. Reset requires typing `RESET`.

This is single-browser storage, without accounts, encryption, cross-device sync, or cross-tab conflict resolution. Keep one active tab per profile and export periodic backups. At the 10,000-event cap, older activity falls out of the analytics window; learned words, notes, and schedules remain.

## LLM integration hook

The UI uses the local mock by default. To connect an LLM, implement a same-origin endpoint, then select **Connected LLM** in Settings. The default path is `/api/debate`. External origins and browser API-key storage are intentionally not part of this interface.

Request:

```http
POST /api/debate
Content-Type: application/json
```

```json
{
  "system": "A fair opponent prompt, including topic, side, framework, and targets…",
  "messages": [
    { "role": "user", "content": "My opening argument…" },
    { "role": "assistant", "content": "An opposing response…" },
    { "role": "user", "content": "My rebuttal…" }
  ]
}
```

Response:

```json
{ "reply": "A concise opposing argument and one focused question." }
```

The adapter checks HTTP status and response shape, times out after 30 seconds, supports cancellation, and lets the learner retry a failed reply without duplicating their message. No conversation is sent anywhere in local mock mode.

`server/example.mjs` is an optional local bridge. It expects your own gateway to accept the same request and return the same response. If calling a provider directly, adapt the `fetch` body and response extraction to that provider’s API. It is not a turnkey vendor integration.

```bash
# Terminal 1: a custom gateway that already implements the contract above
export RHETORIX_UPSTREAM_URL='https://your-gateway.example/debate'
# If needed, set RHETORIX_UPSTREAM_KEY in the server environment.
node server/example.mjs

# Terminal 2
npm run dev
```

Vite proxies `/api` to `http://127.0.0.1:8787`. The example bridge binds only to loopback and validates request shape and size. For public deployment, provide server-side authentication, rate limiting, provider-specific validation, and a server-owned system prompt; browser input is not a trust boundary. A production static host also needs its own `/api` routing; the Vite development proxy is not included in `dist/`.

## Validation and known limits

The production build and automated pure-logic tests pass. Tests cover calendar boundaries, streak gaps, lapse/recall scheduling, queue priority, vocabulary word boundaries, corrupt backups, curriculum/dataset references, and the API request/response contract. The render smoke check builds and server-renders all seven workspaces.

A Chromium executable was unavailable in the build environment and browser download was denied, so visual browser QA and end-to-end browser interactions could not be run here. The responsive CSS includes layouts for mobile, tablet, and desktop, but should receive real-browser review before release. No live LLM service was contacted or tested.

Keyboard support includes visible focus states, a skip link, native form controls, Escape-dismissable modal dialogs, and Space / 1–4 flashcard shortcuts when focus is outside form controls. Reduced-motion preferences are respected.

Suggested browser acceptance pass: complete every drill type; let a timed round expire; rate and reload a flashcard; mark a word and a lesson learned; save a phrase; export/import progress; try a mock debate and its retry path; inspect 390 px and 1440 px layouts; verify keyboard navigation. No backend or cloud deployment has been performed.
