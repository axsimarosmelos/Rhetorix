import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  newState,
  validateState,
  STORAGE_KEY,
  dateKey,
  scheduleCard,
} from "../lib/engine";
import { words, phrases, curriculum, deck } from "../data";
const catalog = {
  learned: new Set(words.map((word) => word.id)),
  bookmarks: new Set(phrases.map((phrase) => phrase.id)),
  completed: new Set(curriculum.map((lesson) => lesson.id)),
  cards: new Set(deck.map((card) => card.id)),
};
export const validateProgress = (value) => validateState(value, catalog);
const Context = createContext(null);
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return {
      state: raw ? validateProgress(JSON.parse(raw)) : newState(),
      warning: "",
      canSave: true,
    };
  } catch {
    return {
      state: newState(),
      warning:
        "Saved progress could not be read. Your original data is preserved. Export this session or import a valid backup in Settings.",
      canSave: false,
    };
  }
}
export function AppProvider({ children }) {
  const [initial] = useState(load);
  const [state, setState] = useState(initial.state);
  const [storageWarning, setStorageWarning] = useState(initial.warning);
  const [canSave, setCanSave] = useState(initial.canSave);
  const [toast, setToast] = useState("");
  const timer = useRef();
  useEffect(() => {
    if (!canSave) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      setStorageWarning("");
    } catch {
      setStorageWarning(
        "Browser storage is unavailable or full. This session works, but export a backup in Settings to keep your progress.",
      );
    }
  }, [state, canSave]);
  useEffect(() => () => clearTimeout(timer.current), []);
  const notify = (message) => {
    setToast(message);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(""), 4000);
  };
  const event = (kind, label, score = null, seconds = 0) => ({
    kind,
    label,
    score,
    seconds: Math.min(86400, Math.max(0, Math.round(seconds))),
    date: dateKey(),
    at: Date.now(),
  });
  const log = (kind, label, score = null, seconds = 0) =>
    setState((s) => ({
      ...s,
      events: [...s.events, event(kind, label, score, seconds)].slice(-10000),
    }));
  const learn = (id) => {
    setState((s) =>
      s.learned.includes(id)
        ? s
        : {
            ...s,
            learned: [...s.learned, id],
            events: [...s.events, event("learn", `Learned ${id}`)].slice(
              -10000,
            ),
          },
    );
    notify("Added to your learned vocabulary");
  };
  const review = (card, rating, seconds) => {
    setState((s) => ({
      ...s,
      cards: { ...s.cards, [card.id]: scheduleCard(s.cards[card.id], rating) },
      learned:
        card.wordId && !s.learned.includes(card.wordId)
          ? [...s.learned, card.wordId]
          : s.learned,
      events: [
        ...s.events,
        event("review", `Reviewed ${card.front}`, null, seconds),
      ].slice(-10000),
    }));
  };
  const toggleBookmark = (id) =>
    setState((s) => ({
      ...s,
      bookmarks: s.bookmarks.includes(id)
        ? s.bookmarks.filter((x) => x !== id)
        : [...s.bookmarks, id],
    }));
  const complete = (id) => {
    setState((s) =>
      s.completed.includes(id)
        ? s
        : {
            ...s,
            completed: [...s.completed, id],
            events: [...s.events, event("lesson", `Completed ${id}`)].slice(
              -10000,
            ),
          },
    );
    notify("Week completed. Keep putting it into practice.");
  };
  const importState = (value) => {
    setState(validateProgress(value));
    setCanSave(true);
    notify("Progress imported successfully");
  };
  return (
    <Context.Provider
      value={{
        state,
        setState,
        storageWarning,
        toast,
        notify,
        log,
        learn,
        review,
        toggleBookmark,
        complete,
        importState,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export const useApp = () => useContext(Context);
