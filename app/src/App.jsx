import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  MessagesSquare,
  Map,
  Mic2,
  Layers,
  ChartNoAxesCombined,
  Settings as SettingsIcon,
  Flame,
  ArrowUpRight,
  Menu,
  X,
  Target,
} from "lucide-react";
import { useApp } from "./context/AppContext";
import { currentWeek, daysLeft, streak } from "./lib/engine";
import { deck } from "./data";
import Dashboard from "./components/Dashboard";
import LexiconExplorer from "./components/LexiconExplorer";
import Phrasebook from "./components/Phrasebook";
import CurriculumMap from "./components/CurriculumMap";
import DebateArena from "./components/DebateArena";
import FlashcardEngine from "./components/FlashcardEngine";
import Progress from "./components/Progress";
import Settings from "./components/Settings";
const links = [
  ["dashboard", "Overview", LayoutDashboard],
  ["lexicon", "Lexicon Explorer", BookOpen],
  ["phrases", "Phrasebook", MessagesSquare],
  ["curriculum", "Curriculum Map", Map],
  ["arena", "Debate Arena", Mic2],
  ["flashcards", "Flashcard Engine", Layers],
  ["progress", "Your Progress", ChartNoAxesCombined],
];
export default function App() {
  const { state, storageWarning, toast } = useApp();
  const [page, setPage] = useState(() =>
    links.some((x) => `#${x[0]}` === location.hash)
      ? location.hash.slice(1)
      : "dashboard",
  );
  const [mobile, setMobile] = useState(false);
  const [compact, setCompact] = useState(false);
  const [settings, setSettings] = useState(false);
  const [intent, setIntent] = useState("");
  const [clock, setClock] = useState(Date.now());
  useEffect(() => {
    const media = window.matchMedia("(max-width: 760px)");
    const update = () => setCompact(media.matches);
    update();
    media.addEventListener("change", update);
    const escape = (event) => {
      if (event.key === "Escape") setMobile(false);
    };
    window.addEventListener("keydown", escape);
    return () => {
      media.removeEventListener("change", update);
      window.removeEventListener("keydown", escape);
    };
  }, []);
  useEffect(() => {
    const t = setInterval(() => setClock(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    const onHash = () => {
      const p = location.hash.slice(1);
      if (links.some((x) => x[0] === p)) {
        setPage(p);
        setMobile(false);
      }
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  useEffect(() => {
    document.title = `${links.find((x) => x[0] === page)?.[1]} · Rhetorix`;
  }, [page]);
  const navigate = (p, action = "") => {
    setPage(p);
    setIntent(action);
    setMobile(false);
    location.hash = p;
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  const due = deck.filter((c) => state.cards[c.id]?.due <= clock).length;
  const now = new Date(clock);
  const week = currentWeek(state, now);
  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      {mobile && (
        <button
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setMobile(false)}
        />
      )}
      <aside
        className={`sidebar ${mobile ? "open" : ""}`}
        inert={compact && !mobile ? true : undefined}
      >
        <button
          className="brand"
          aria-label="Rhetorix home"
          onClick={() => navigate("dashboard")}
        >
          <span className="brand-mark">
            <span />
            <span />
            <span />
          </span>
          rhetorix<span className="brand-dot">.</span>
        </button>
        <div className="brand-sub">THE SPEAKING STUDIO</div>
        <button
          className="mobile-close icon-btn"
          aria-label="Close navigation"
          onClick={() => setMobile(false)}
        >
          <X />
        </button>
        <div className="nav-caption">YOUR WORKSPACE</div>
        <nav aria-label="Main navigation">
          {links.map(([id, label, Icon]) => (
            <button
              key={id}
              onClick={() => navigate(id)}
              className={`nav-item ${page === id ? "active" : ""}`}
              aria-current={page === id ? "page" : undefined}
            >
              <Icon size={19} />
              <span>{label}</span>
              {id === "flashcards" && due > 0 && (
                <span className="nav-count">{due}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="journey-card">
            <div className="flex justify-between items-center">
              <span className="eyebrow">THE 16-WEEK JOURNEY</span>
              <ArrowUpRight size={16} />
            </div>
            <div className="journey-week">
              Week {week}
              <span> / 16</span>
            </div>
            <div className="progress-track">
              <span
                style={{ width: `${(state.completed.length / 16) * 100}%` }}
              />
            </div>
            <p>
              {state.completed.length} weeks completed. One voice, evolving.
            </p>
            <button
              onClick={() => navigate("curriculum")}
              className="text-link"
            >
              See your roadmap <ArrowUpRight size={14} />
            </button>
          </div>
          <button className="nav-item" onClick={() => setSettings(true)}>
            <SettingsIcon size={19} />
            Settings & backup
          </button>
          <div className="profile">
            <span className="avatar">
              {(state.name || "S").slice(0, 1).toUpperCase()}
            </span>
            <div>
              <strong>{state.name || "Speaker"}</strong>
              <span>A little better, every day.</span>
            </div>
            <span className="status-dot" />
          </div>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="flex items-center gap-3">
            <button
              className="icon-btn menu-toggle"
              aria-label="Open navigation"
              onClick={() => setMobile(true)}
            >
              <Menu size={22} />
            </button>
            <span className="topbar-context">
              Workspace <span>/</span>{" "}
              <strong>{links.find((x) => x[0] === page)?.[1]}</strong>
            </span>
          </div>
          <div className="topbar-right">
            <span className="streak-pill">
              <Flame size={16} />
              {streak(state.events, now)} day streak
            </span>
            <button className="goal-button" onClick={() => setSettings(true)}>
              <Target size={16} />
              <span>{daysLeft(state.targetDate, now)} days to your goal</span>
              <ArrowUpRight size={14} />
            </button>
          </div>
        </header>
        <main id="main-content" className="main-content" tabIndex={-1}>
          {storageWarning && (
            <div className="notice warning" role="alert">
              {storageWarning}
            </div>
          )}
          {page === "dashboard" && (
            <Dashboard navigate={navigate} clock={clock} />
          )}
          {page === "lexicon" && <LexiconExplorer initialTab={intent} />}{" "}
          {page === "phrases" && <Phrasebook />}
          {page === "curriculum" && <CurriculumMap />}
          {page === "arena" && <DebateArena initialTab={intent} />}{" "}
          {page === "flashcards" && <FlashcardEngine clock={clock} />}{" "}
          {page === "progress" && <Progress clock={clock} />}
          <footer className="page-footer">
            <span>Clear thinking. Considered words. Lasting impact.</span>
            <span>RHETORIX / YOUR DAILY PRACTICE</span>
          </footer>
        </main>
      </div>
      {settings && <Settings onClose={() => setSettings(false)} />}
      <div className={`toast ${toast ? "visible" : ""}`} role="status">
        {toast}
      </div>
    </div>
  );
}
