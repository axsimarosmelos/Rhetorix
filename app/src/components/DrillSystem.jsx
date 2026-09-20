import { useCallback, useRef, useState } from "react";
import {
  TextCursorInput,
  ScanSearch,
  AudioLines,
  Zap,
  ArrowRight,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Clock3,
} from "lucide-react";
import { words, roots, phrases } from "../data";
import { shuffle, normalize } from "../lib/engine";
import { useCountdown, elapsed } from "../lib/useCountdown";
import { useApp } from "../context/AppContext";
import { Badge, Button, ProgressBar } from "./UI";
const modes = [
  {
    name: "Cloze deletion",
    icon: TextCursorInput,
    description: "Find the word that makes the sentence work.",
    color: "sage",
  },
  {
    name: "Root decoding",
    icon: ScanSearch,
    description: "Unlock the meaning inside a familiar word part.",
    color: "blue",
  },
  {
    name: "Tone matching",
    icon: AudioLines,
    description: "Read the room. Choose the intended tone.",
    color: "lavender",
  },
  {
    name: "Speed recall",
    icon: Zap,
    description: "Turn recognition into fast, active recall.",
    color: "peach",
  },
];
function questions(mode) {
  if (mode === "Root decoding")
    return shuffle(roots)
      .slice(0, 5)
      .map((r) => ({
        prompt: `What does the root “${r.root}” mean?`,
        answer: r.meaning,
        options: shuffle([
          r.meaning,
          ...shuffle(roots.filter((x) => x.id !== r.id))
            .slice(0, 3)
            .map((x) => x.meaning),
        ]),
        explanation: `${r.origin} · ${r.examples.join(", ")}`,
      }));
  if (mode === "Tone matching")
    return shuffle(phrases)
      .slice(0, 5)
      .map((p) => ({
        prompt: `Choose the intended tone: “${p.text}”`,
        answer: p.tone,
        options: shuffle([
          p.tone,
          ...shuffle(
            [...new Set(phrases.map((x) => x.tone))].filter(
              (t) => t !== p.tone,
            ),
          ).slice(0, 3),
        ]),
        explanation: `${p.usage} Tone also depends on delivery and context.`,
      }));
  return shuffle(words)
    .slice(0, 5)
    .map((w) => ({
      prompt: mode === "Cloze deletion" ? w.cloze : w.definition,
      answer: w.word,
      explanation: w.example,
    }));
}
export default function DrillSystem() {
  const [mode, setMode] = useState(null);
  const [seconds, setSeconds] = useState(20);
  return mode ? (
    <DrillRound
      key={mode}
      mode={mode}
      seconds={seconds}
      onExit={() => setMode(null)}
    />
  ) : (
    <>
      <div className="section-heading">
        <div>
          <h2>Knowledge becomes instinct through practice.</h2>
          <p className="muted">
            Five questions per session. A little effort, a stronger memory.
          </p>
        </div>
      </div>
      <div className="drill-grid">
        {modes.map(({ name, icon: Icon, description, color }) => (
          <button
            className="card drill-card"
            key={name}
            onClick={() => setMode(name)}
          >
            <span className={`icon-tile large ${color}`}>
              <Icon size={24} />
            </span>
            <h3>{name}</h3>
            <p>{description}</p>
            <span className="text-link">
              Start drill <ArrowRight size={16} />
            </span>
          </button>
        ))}
      </div>
      <label className="inline-label">
        Speed recall timer{" "}
        <select
          value={seconds}
          onChange={(e) => setSeconds(Number(e.target.value))}
        >
          {[10, 20, 30, 60].map((n) => (
            <option value={n} key={n}>
              {n} seconds per word
            </option>
          ))}
        </select>
      </label>
    </>
  );
}
function DrillRound({ mode, seconds, onExit }) {
  const { log } = useApp();
  const [items] = useState(() => questions(mode));
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);
  const [deadline, setDeadline] = useState(
    mode === "Speed recall" ? Date.now() + seconds * 1000 : null,
  );
  const start = useRef(Date.now());
  const submitting = useRef(false);
  const expire = useCallback(() => {
    if (submitting.current) return;
    submitting.current = true;
    setFeedback({ correct: false, timedOut: true });
    setDeadline(null);
  }, []);
  const remaining = useCountdown(deadline, expire);
  const item = items[index];
  const submit = (e) => {
    e?.preventDefault();
    if (feedback || submitting.current || !answer.trim()) return;
    if (deadline && Date.now() >= deadline) {
      expire();
      return;
    }
    submitting.current = true;
    const right = normalize(answer) === normalize(item.answer);
    setFeedback({ correct: right });
    setDeadline(null);
    if (right) setCorrect((n) => n + 1);
  };
  const next = () => {
    if (index === items.length - 1) {
      log(
        "drill",
        mode,
        (correct / items.length) * 100,
        elapsed(start.current),
      );
      setDone(true);
    } else {
      setIndex((n) => n + 1);
      setAnswer("");
      setFeedback(null);
      submitting.current = false;
      setDeadline(mode === "Speed recall" ? Date.now() + seconds * 1000 : null);
    }
  };
  if (done)
    return (
      <div className="card completion">
        <span className="icon-tile large sage">
          <CheckCircle2 size={30} />
        </span>
        <div className="eyebrow">SESSION COMPLETE</div>
        <h2>
          {correct} out of {items.length}. Every attempt counts.
        </h2>
        <p>
          {correct === 5
            ? "Accurate and ready to use. Try saying each answer in a fresh sentence."
            : "Review the explanations, then revisit these ideas in your flashcards."}
        </p>
        <strong className="score-big">{(correct / items.length) * 100}%</strong>
        <Button onClick={onExit}>
          <RotateCcw size={17} /> Choose another drill
        </Button>
      </div>
    );
  return (
    <div className="card exercise-card">
      <div className="flex justify-between items-center gap-3">
        <Badge>{mode}</Badge>
        <span
          className={`timer ${remaining !== null && remaining <= 5 ? "urgent" : ""}`}
        >
          <Clock3 size={17} />
          {remaining !== null
            ? `${remaining}s`
            : `Question ${index + 1} of ${items.length}`}
        </span>
      </div>
      <ProgressBar
        value={(index / items.length) * 100}
        label="Drill progress"
      />
      <div className="eyebrow mt-8">
        {mode === "Speed recall" ? "NAME THE WORD" : "YOUR CHALLENGE"}
      </div>
      <h2 className="question">{item.prompt}</h2>
      <form onSubmit={submit}>
        {item.options ? (
          <div className="answer-grid">
            {item.options.map((o) => (
              <button
                key={o}
                type="button"
                className={`answer-option ${answer === o ? "selected" : ""}`}
                aria-pressed={answer === o}
                disabled={!!feedback}
                onClick={() => setAnswer(o)}
              >
                {o}
              </button>
            ))}
          </div>
        ) : (
          <label className="field">
            Your answer
            <input
              key={index}
              autoFocus
              autoComplete="off"
              value={answer}
              disabled={!!feedback}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type the word…"
            />
          </label>
        )}
        {!feedback && (
          <Button type="submit" disabled={!answer.trim()}>
            Check answer <ArrowRight size={16} />
          </Button>
        )}
      </form>
      {feedback && (
        <div
          className={`feedback ${feedback.correct ? "success" : "incorrect"}`}
          role="status"
        >
          <strong>
            {feedback.correct ? (
              <CheckCircle2 size={19} />
            ) : (
              <XCircle size={19} />
            )}{" "}
            {feedback.correct
              ? "Correct."
              : feedback.timedOut
                ? "Time is up."
                : "Not quite."}
          </strong>
          <p>
            Answer: <b>{item.answer}</b>
          </p>
          <p>{item.explanation}</p>
          <Button onClick={next}>
            {index === items.length - 1 ? "See results" : "Next question"}
            <ArrowRight size={16} />
          </Button>
        </div>
      )}
      <button className="text-link mt-6" onClick={onExit}>
        Exit drill
      </button>
    </div>
  );
}
