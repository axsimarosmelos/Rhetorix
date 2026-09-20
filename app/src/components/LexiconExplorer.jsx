import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  Check,
  Volume2,
  ArrowUpRight,
  BookOpen,
} from "lucide-react";
import { words, roots } from "../data";
import { useApp } from "../context/AppContext";
import { Badge, Button, Empty, PageHeading, Tabs } from "./UI";
import DrillSystem from "./DrillSystem";
export default function LexiconExplorer({ initialTab }) {
  const { state, learn, notify } = useApp();
  const [tab, setTab] = useState(initialTab === "Drills" ? "Drills" : "Words");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState(words[0].id);
  const shown = useMemo(
    () =>
      words.filter(
        (w) =>
          (category === "All" ||
            (category === "Learned" && state.learned.includes(w.id)) ||
            w.category === category) &&
          `${w.word} ${w.definition} ${w.base.text}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [query, category, state.learned],
  );
  const word = words.find((w) => w.id === selected) || words[0];
  const speak = () => {
    if (!("speechSynthesis" in window)) {
      notify("Speech playback is unavailable in this browser.");
      return;
    }
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word.word);
    utterance.lang = "en-US";
    utterance.rate = 0.8;
    speechSynthesis.speak(utterance);
  };
  return (
    <>
      <PageHeading
        eyebrow="THE WORD WORKSHOP"
        title="Give your thoughts better words."
        description="Learn the pieces. Understand the meaning. Make the word your own."
        action={
          <Badge>
            {state.learned.length} / {words.length} LEARNED
          </Badge>
        }
      />
      <Tabs
        items={["Words", "Roots", "Drills"]}
        value={tab}
        onChange={setTab}
      />
      {tab === "Drills" ? (
        <DrillSystem />
      ) : (
        <>
          <div className="filter-bar">
            <label className="search-field">
              <Search size={18} />
              <input
                aria-label="Search lexicon"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  tab === "Words"
                    ? "Search words, meanings, or roots…"
                    : "Search roots or meanings…"
                }
              />
            </label>
            {tab === "Words" && (
              <select
                aria-label="Vocabulary category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {[
                  "All",
                  "Learned",
                  ...new Set(words.map((w) => w.category)),
                ].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            )}
            <span className="muted text-sm">
              {tab === "Words"
                ? shown.length
                : roots.filter((r) =>
                    `${r.root} ${r.meaning}`
                      .toLowerCase()
                      .includes(query.toLowerCase()),
                  ).length}{" "}
              entries
            </span>
          </div>
          {tab === "Words" ? (
            <div className="lexicon-layout">
              <div className="word-list card">
                {shown.length ? (
                  shown.map((w) => (
                    <button
                      className={`word-list-item ${selected === w.id ? "selected" : ""}`}
                      key={w.id}
                      onClick={() => setSelected(w.id)}
                    >
                      <span>
                        <strong>{w.word}</strong>
                        <span>
                          {w.partOfSpeech} · {w.category}
                        </span>
                      </span>
                      {state.learned.includes(w.id) ? (
                        <Check size={17} />
                      ) : (
                        <ArrowUpRight size={16} />
                      )}
                    </button>
                  ))
                ) : (
                  <Empty title="No words found">
                    Try another word, meaning, or category.
                  </Empty>
                )}
              </div>
              <article className="card word-detail">
                <div className="flex justify-between items-center">
                  <Badge>{word.category}</Badge>
                  <button
                    className="icon-btn"
                    onClick={speak}
                    aria-label={`Pronounce ${word.word}`}
                  >
                    <Volume2 size={20} />
                  </button>
                </div>
                <h2>{word.word}</h2>
                <span className="word-pos">{word.partOfSpeech}</span>
                <p className="definition">{word.definition}</p>
                <div className="eyebrow">TAKE IT APART</div>
                <div className="morphology">
                  {[
                    ["PREFIX", word.prefix],
                    ["ROOT / BASE", word.base],
                    ["SUFFIX", word.suffix],
                  ].map(([label, part], i) => (
                    <div key={label} className={`morpheme morph-${i}`}>
                      <span>{label}</span>
                      <strong>{part.text || "∅"}</strong>
                      <p>{part.meaning}</p>
                    </div>
                  ))}
                </div>
                <p className="morph-note">
                  {word.note} An absent affix is shown as ∅.
                </p>
                <div className="example">
                  <span className="eyebrow">IN CONTEXT</span>
                  <p>“{word.example}”</p>
                </div>
                <div className="word-detail-foot">
                  <Button
                    onClick={() => learn(word.id)}
                    disabled={state.learned.includes(word.id)}
                  >
                    {state.learned.includes(word.id) ? (
                      <>
                        <Check size={17} /> Learned
                      </>
                    ) : (
                      <>
                        <Plus size={17} /> Add to learned words
                      </>
                    )}
                  </Button>
                  <button
                    className="text-link"
                    onClick={() => setTab("Drills")}
                  >
                    Put it to work <ArrowUpRight size={16} />
                  </button>
                </div>
              </article>
            </div>
          ) : (
            <div className="root-grid">
              {roots
                .filter((r) =>
                  `${r.root} ${r.meaning}`
                    .toLowerCase()
                    .includes(query.toLowerCase()),
                )
                .map((r) => (
                  <article className="card root-card" key={r.id}>
                    <Badge color="neutral">{r.origin}</Badge>
                    <h2>{r.root}</h2>
                    <h3>{r.meaning}</h3>
                    <p>{r.examples.join(" · ")}</p>
                    <span className="muted text-xs">
                      Reinforce this root in the Flashcard Engine.
                    </span>
                  </article>
                ))}
            </div>
          )}
          <div className="notice">
            <BookOpen size={18} />
            <span>
              Word parts are clues, not complete definitions. These learning
              decompositions show bound stems and spelling changes; always check
              the full word in context.
            </span>
          </div>
        </>
      )}
    </>
  );
}
