# Rhetorix

**A four-month speaking studio for clearer thinking, stronger arguments, and confident delivery.**

[Open Rhetorix](https://axsimarosmelos.github.io/Rhetorix/)

Built with React, Vite, Tailwind CSS, Lucide icons, and browser local storage.

## GitHub Pages

The production site is committed at the root of the `main` branch. In **Settings → Pages**, use:

- **Source:** Deploy from a branch
- **Branch:** `main`
- **Folder:** `/(root)`

The `.nojekyll` file allows GitHub Pages to serve the compiled assets directly. Relative asset URLs support the `/Rhetorix/` project path. App navigation uses hash routes, so refreshing an app section does not require server-side rewrites.

GitHub Pages hosts the static app. Vocabulary practice, drills, lessons, flashcards, progress, and the local mock debate opponent work without a server. Connecting a real LLM requires a separately hosted backend and routing; the optional development API bridge is not deployed by Pages.

## What is included

- A daily dashboard, four-month countdown, streaks, quiz analytics, and activity tracking.
- 32 vocabulary entries with morphological breakdowns, 20 roots, and 24 rhetorical phrases.
- Cloze deletion, root decoding, tone matching, and timed speed recall.
- A complete 16-week curriculum with lessons, reading overviews, practice, and checkpoints.
- Timed fallacy refutation, thesis defense with target vocabulary, and a local mock opponent.
- Spaced repetition across vocabulary, roots, and debate techniques.
- Search, saved phrases, lesson notes, pronunciation, and JSON progress backups.

## Run locally

Use Node.js 22.12 or newer:

```bash
git clone https://github.com/axsimarosmelos/Rhetorix.git
cd Rhetorix
npm run setup
npm run dev
```

The editable Vite project is in [`app/`](app/). Setup installs its locked dependencies. Alternatively, run `npm ci` and `npm run dev` inside `app/`.

## Update the published site

Edit `app/src/`, then run these commands from the repository root:

```bash
npm test
npm run test:render
npm run build
git add app scripts package.json README.md index.html assets .nojekyll .gitignore
git commit -m "Update Rhetorix"
git push origin main
```

The build compiles the React application and refreshes the root-level `index.html` and `assets/` directory. Commit the generated files together with the source changes. GitHub Pages then publishes the branch.

Do not edit `assets/` directly: it is replaced by the publish script. The React source, JSON datasets, and backend example remain in `app/`.

## Project guide

See [`app/README.md`](app/README.md) for full initialization commands, component structure, dataset schemas, teaching design, scheduling behavior, backup handling, and the LLM API contract.

All learning progress is local to the browser. Use **Settings & backup** to export it before moving devices or clearing browser data. The built-in mock opponent uses scripted critical-thinking prompts and is explicitly labeled; it is not an LLM or a fact-checker.

## Verification

The build, 15 logic/data/API tests, and 11 server-render smoke checks passed before upload. Browser visual testing was unavailable in the build environment because Chromium could not be downloaded. No live LLM service was contacted.
