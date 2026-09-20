import { useEffect, useRef, useState } from "react";
import { Layers, RotateCcw, ArrowRight, CheckCircle2, Eye } from "lucide-react";
import { deck } from "../data";
import { makeQueue, scheduleCard } from "../lib/engine";
import { elapsed } from "../lib/useCountdown";
import { useApp } from "../context/AppContext";
import { Badge, Button, Empty, PageHeading, ProgressBar } from "./UI";
export default function FlashcardEngine({ clock }) {
  const { state, review } = useApp();
  const [filter, setFilter] = useState("All");
  const [queue, setQueue] = useState(null);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [ratings, setRatings] = useState([]);
  const start = useRef(Date.now());
  const guarded = useRef(false);
  const due = deck.filter(
    (c) =>
      (filter === "All" || c.type === filter) &&
      state.cards[c.id]?.due <= clock,
  ).length;
  const unseen = deck.filter(
    (c) => (filter === "All" || c.type === filter) && !state.cards[c.id],
  ).length;
  const card = queue?.[index];
  const done = queue && index >= queue.length;
  const begin = () => {
    setQueue(makeQueue(deck, state.cards, filter));
    setIndex(0);
    setRatings([]);
    setRevealed(false);
    guarded.current = false;
    start.current = Date.now();
  };
  const rate = (rating) => {
    if (!revealed || !card || guarded.current) return;
    guarded.current = true;
    review(card, rating, elapsed(start.current));
    setRatings((r) => [...r, rating]);
    setIndex((i) => i + 1);
    setRevealed(false);
    start.current = Date.now();
  };
  useEffect(() => {
    guarded.current = false;
  }, [index]);
  useEffect(() => {
    const onKey = (e) => {
      if (
        !card ||
        done ||
        ["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(
          document.activeElement?.tagName,
        )
      )
        return;
      if (e.code === "Space") {
        e.preventDefault();
        setRevealed(true);
      }
      if (revealed && ["1", "2", "3", "4"].includes(e.key))
        rate(["again", "hard", "good", "easy"][Number(e.key) - 1]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });
  return (
    <>
      <PageHeading
        eyebrow="REMEMBER WHAT MATTERS"
        title="Make knowledge second nature."
        description="Retrieve it. Say it aloud. Let spaced repetition take care of when to revisit it."
      />
      {!queue ? (
        <>
          <div className="review-overview">
            <div className="card review-intro">
              <span className="icon-tile large sage">
                <Layers size={28} />
              </span>
              <h2>
                A small session.
                <br />A lasting memory.
              </h2>
              <p>
                Review up to 10 cards across words, roots, and debate
                techniques. Due cards come first, followed by new material.
              </p>
              <label className="field">
                Choose your deck
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  {["All", "Vocabulary", "Roots", "Techniques"].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
              <Button disabled={!due && !unseen} onClick={begin}>
                Start review <ArrowRight size={17} />
              </Button>
            </div>
            <div className="review-stats">
              <div className="card">
                <span className="eyebrow">READY TO REVISIT</span>
                <strong>{due}</strong>
                <p>scheduled cards due now</p>
              </div>
              <div className="card">
                <span className="eyebrow">ROOM TO GROW</span>
                <strong>{unseen}</strong>
                <p>new cards in this deck</p>
              </div>
              <div className="notice">
                Again returns in 10 minutes. Successful recalls get longer
                intervals. Rate your actual recall before moving on.
              </div>
            </div>
          </div>
          {!due && !unseen && (
            <Empty title="You’re up to date">
              Your next review will appear when a scheduled card is due. Try a
              different deck in the meantime.
            </Empty>
          )}
        </>
      ) : done ? (
        <div className="card completion">
          <span className="icon-tile large sage">
            <CheckCircle2 size={30} />
          </span>
          <div className="eyebrow">PRACTICE, BANKED</div>
          <h2>{queue.length} cards. A little more fluent.</h2>
          <p>
            {ratings.filter((r) => r === "good" || r === "easy").length}{" "}
            recalled confidently. Difficult cards will return sooner.
          </p>
          <Button onClick={() => setQueue(null)}>
            <RotateCcw size={17} /> Back to your decks
          </Button>
        </div>
      ) : (
        <div className="flashcard-workspace">
          <div className="flex justify-between items-center">
            <Badge>{card.type}</Badge>
            <span className="muted text-sm">
              {index + 1} of {queue.length}
            </span>
          </div>
          <ProgressBar
            value={(index / queue.length) * 100}
            label="Review progress"
          />
          <div className={`flashcard card ${revealed ? "revealed" : ""}`}>
            <div className="eyebrow">
              {revealed ? "CONNECT THE MEANING" : "RECALL BEFORE YOU REVEAL"}
            </div>
            <h2>{card.front}</h2>
            {revealed ? (
              <>
                <p className="flashcard-answer">{card.back}</p>
                <p className="flashcard-detail">{card.detail}</p>
              </>
            ) : (
              <>
                <p>
                  {card.type === "Vocabulary"
                    ? "What does it mean? Use it in a sentence."
                    : card.type === "Roots"
                      ? "What does this root mean? Name a related word."
                      : "How does it work? Explain it in your own words."}
                </p>
                <Button onClick={() => setRevealed(true)}>
                  <Eye size={18} /> Reveal answer
                </Button>
              </>
            )}
          </div>
          {revealed ? (
            <div className="rating-section">
              <p>How well did you recall it?</p>
              <div className="rating-grid">
                {["again", "hard", "good", "easy"].map((rating, i) => {
                  const c = scheduleCard(state.cards[card.id], rating);
                  return (
                    <button
                      className={`rating ${rating}`}
                      key={rating}
                      onClick={() => rate(rating)}
                    >
                      <strong>
                        <span>{i + 1}</span>
                        {rating}
                      </strong>
                      <span>
                        {rating === "again"
                          ? "10 minutes"
                          : `${c.interval} day${c.interval > 1 ? "s" : ""}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="keyboard-hint">
              Say your answer aloud, then reveal. Keyboard: Space to reveal ·
              1–4 to rate.
            </p>
          )}
          <button className="text-link" onClick={() => setQueue(null)}>
            End session · rated cards are saved
          </button>
        </div>
      )}
    </>
  );
}
