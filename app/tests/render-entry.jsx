import React from "react";
import { renderToString } from "react-dom/server";
import App from "../src/App";
import { AppProvider } from "../src/context/AppContext";
import DebateArena from "../src/components/DebateArena";
import LexiconExplorer from "../src/components/LexiconExplorer";
import Settings from "../src/components/Settings";
export function renderWorkspace(page) {
  globalThis.location = { hash: `#${page}` };
  globalThis.localStorage = { getItem: () => null, setItem: () => {} };
  return renderToString(
    <AppProvider>
      <App />
    </AppProvider>,
  );
}
export function renderExtras() {
  return [
    <DebateArena initialTab="Thesis Defense" />,
    <DebateArena initialTab="Mock Debate" />,
    <LexiconExplorer initialTab="Drills" />,
    <Settings onClose={() => {}} />,
  ].map((element, i) =>
    renderToString(<AppProvider key={i}>{element}</AppProvider>),
  );
}
