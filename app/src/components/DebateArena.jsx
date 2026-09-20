import { useCallback, useEffect, useRef, useState } from "react";
import {
  Mic2,
  Timer,
  ArrowRight,
  RotateCcw,
  Check,
  Send,
  MessageSquare,
  ShieldCheck,
  ChevronDown,
  Square,
  Download,
} from "lucide-react";
import { fallacies, prompts, words, techniques } from "../data";
import { containsWord, shuffle } from "../lib/engine";
import { elapsed, useCountdown } from "../lib/useCountdown";
import { buildDebatePrompt, getDebateReply } from "../lib/debate";
import { useApp } from "../context/AppContext";
import { Badge, Button, PageHeading, Tabs } from "./UI";
const timeChoices = [60, 90, 120, 180, 300];
function TimerChoice({ value, onChange }) {
  return (
    <label className="inline-label">
      <Timer size={17} /> Round length
      <select value={value} onChange={(e) => onChange(Number(e.target.value))}>
        {timeChoices.map((n) => (
          <option key={n} value={n}>
            {n} seconds
          </option>
        ))}
      </select>
    </label>
  );
}
const Clock = ({ remaining }) => (
  <span className={`timer ${remaining <= 15 ? "urgent" : ""}`}>
    <Timer size={18} />
    {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, "0")}
  </span>
);
export default function DebateArena({ initialTab }) {
  const [tab, setTab] = useState(
    ["Fallacy Spotter", "Thesis Defense", "Mock Debate"].includes(initialTab)
      ? initialTab
      : "Fallacy Spotter",
  );
  return (
    <>
      <PageHeading
        eyebrow="THE PRACTICE FLOOR"
        title="Meet the moment."
        description="Pressure-test your reasoning. Practice your response. Leave a little more prepared."
      />
      <Tabs
        items={["Fallacy Spotter", "Thesis Defense", "Mock Debate"]}
        value={tab}
        onChange={setTab}
      />
      {tab === "Fallacy Spotter" ? (
        <FallacySpotter />
      ) : tab === "Thesis Defense" ? (
        <ThesisDefense />
      ) : (
        <MockDebate />
      )}
    </>
  );
}
function FallacySpotter() {
  const { log } = useApp();
  const [scenario, setScenario] = useState(() => shuffle(fallacies)[0]);
  const [seconds, setSeconds] = useState(90);
  const [active, setActive] = useState(false);
  const [deadline, setDeadline] = useState(null);
  const [diagnosis, setDiagnosis] = useState("");
  const [fields, setFields] = useState({
    claim: "",
    objection: "",
    because: "",
    therefore: "",
  });
  const [result, setResult] = useState(null);
  const start = useRef(0);
  const finished = useRef(false);
  const finish = useCallback(
    (expired = false) => {
      if (finished.current) return;
      finished.current = true;
      setDeadline(null);
      setActive(false);
      const correct = diagnosis === scenario.id;
      setResult({ correct, expired });
      log(
        "arena",
        `Fallacy spotter: ${scenario.name}`,
        null,
        elapsed(start.current),
      );
    },
    [diagnosis, scenario, log],
  );
  const expire = useCallback(() => finish(true), [finish]);
  const remaining = useCountdown(deadline, expire);
  const begin = () => {
    finished.current = false;
    setActive(true);
    start.current = Date.now();
    setDeadline(Date.now() + seconds * 1000);
  };
  const reset = () => {
    setScenario(shuffle(fallacies.filter((f) => f.id !== scenario.id))[0]);
    setResult(null);
    setDiagnosis("");
    setFields({ claim: "", objection: "", because: "", therefore: "" });
  };
  const filled = Object.values(fields).every((v) => v.trim().length >= 5);
  return (
    <div className="arena-layout">
      <section className="card arena-main">
        <div className="flex justify-between items-center">
          <Badge color="peach">FALLACY & WEAKNESS SPOTTER</Badge>
          {active && <Clock remaining={remaining ?? seconds} />}
        </div>
        <h2>
          Find the flaw.
          <br />
          Build the refutation.
        </h2>
        {!active && !result ? (
          <>
            <p className="muted">
              An opposing argument is waiting. Identify the logical flaw, then
              respond using four precise moves before the timer runs out.
            </p>
            <div className="arena-brief">
              <span>01 Identify the claim</span>
              <span>02 Diagnose the inference</span>
              <span>03 Refute with a reason</span>
            </div>
            <TimerChoice value={seconds} onChange={setSeconds} />
            <Button onClick={begin}>
              Start the round <ArrowRight size={17} />
            </Button>
          </>
        ) : (
          <>
            <div className="opponent-argument">
              <div className="eyebrow">THE OPPOSING ARGUMENT</div>
              <blockquote>“{scenario.argument}”</blockquote>
            </div>
            <label className="field">
              Which logical flaw is present?
              <select
                value={diagnosis}
                disabled={!!result}
                onChange={(e) => setDiagnosis(e.target.value)}
              >
                <option value="">Select the fallacy…</option>
                {fallacies.map((f) => (
                  <option value={f.id} key={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="refutation-grid">
              {[
                ["claim", "They say…", "Restate the actual claim."],
                ["objection", "I respond…", "Name the specific flaw."],
                ["because", "Because…", "Give a reason or counterexample."],
                ["therefore", "Therefore…", "Explain what follows."],
              ].map(([id, label, placeholder]) => (
                <label className="field" key={id}>
                  {label}
                  <textarea
                    maxLength={2000}
                    value={fields[id]}
                    disabled={!!result}
                    placeholder={placeholder}
                    onChange={(e) =>
                      setFields((f) => ({ ...f, [id]: e.target.value }))
                    }
                  />
                </label>
              ))}
            </div>
            {!result ? (
              <>
                <Button
                  disabled={!diagnosis || !filled}
                  onClick={() => finish(Date.now() >= deadline)}
                >
                  Submit refutation <ShieldCheck size={17} />
                </Button>
                <p className="muted text-xs mt-3">
                  Choose a flaw and write at least 5 characters in each step.
                </p>
              </>
            ) : (
              <div
                className={`feedback ${result.correct ? "success" : "incorrect"}`}
                role="status"
              >
                <strong>
                  {result.expired ? "Time is up. " : ""}
                  {result.correct
                    ? "Correct diagnosis."
                    : "Review the diagnosis."}
                </strong>
                <h3>{scenario.name}</h3>
                <p>{scenario.definition}</p>
                <p>
                  <b>The weakness:</b> {scenario.weakness}
                </p>
                <p>
                  <b>A stronger response:</b> {scenario.refutation}
                </p>
                <p className="text-sm">
                  Your structure:{" "}
                  {
                    Object.values(fields).filter((v) => v.trim().length >= 5)
                      .length
                  }
                  /4 moves present. The diagnosis is checked automatically;
                  compare your reasoning with the model response.
                </p>
                <Button onClick={reset}>
                  <RotateCcw size={16} /> Next challenge
                </Button>
              </div>
            )}
          </>
        )}
      </section>
      <aside className="arena-aside">
        <div className="card">
          <span className="icon-tile sage">
            <ShieldCheck size={22} />
          </span>
          <h3>Attack the inference.</h3>
          <p>
            A fallacy label is a starting point. Explain why the evidence fails
            to establish the conclusion, then show what would be needed.
          </p>
          <div className="divider" />
          <div className="eyebrow">YOUR RESPONSE FRAMEWORK</div>
          <ol>
            <li>State their actual claim.</li>
            <li>Identify the problem.</li>
            <li>Give a reason or counterexample.</li>
            <li>Explain the implication.</li>
          </ol>
        </div>
        <div className="small-quote">
          “The strongest response begins with the fairest reading.”
          <span>YOUR PRACTICE PRINCIPLE</span>
        </div>
      </aside>
    </div>
  );
}
function initialTargets(learned) {
  const ids = [
    ...learned.slice(-3),
    ...["credible", "tenable", "persuasive", "inexplicable"],
  ];
  return [...new Set(ids)]
    .map((id) => words.find((w) => w.id === id))
    .filter(Boolean)
    .slice(0, 3);
}
function ThesisDefense() {
  const { state, learn, log } = useApp();
  const [promptIndex, setPromptIndex] = useState(0);
  const prompt = prompts[promptIndex];
  const [targets, setTargets] = useState(() => initialTargets(state.learned));
  const [stance, setStance] = useState("Defend");
  const [framework, setFramework] = useState("toulmin");
  const structure = techniques.find((t) => t.id === framework);
  const [seconds, setSeconds] = useState(180);
  const [deadline, setDeadline] = useState(null);
  const [active, setActive] = useState(false);
  const [fields, setFields] = useState({});
  const [result, setResult] = useState(null);
  const start = useRef(0);
  const finished = useRef(false);
  const text = Object.values(fields).join(" ");
  const used = targets.filter((w) => containsWord(text, w.word));
  const filled = structure.steps.every(
    (s, i) => (fields[i] || "").trim().length >= 10,
  );
  const ready = targets.every((w) => state.learned.includes(w.id));
  const finish = useCallback(
    (expired = false) => {
      if (finished.current) return;
      finished.current = true;
      setDeadline(null);
      setActive(false);
      setResult({ expired });
      log(
        "arena",
        `Thesis defense: ${stance} (${structure.name})`,
        null,
        elapsed(start.current),
      );
    },
    [log, stance, structure],
  );
  const expire = useCallback(() => finish(true), [finish]);
  const remaining = useCountdown(deadline, expire);
  const newPrompt = () => {
    setPromptIndex((i) => (i + 1) % prompts.length);
    setFields({});
    setResult(null);
    setTargets(initialTargets(state.learned));
  };
  return (
    <div className="arena-layout">
      <section className="card arena-main">
        <div className="flex justify-between items-center">
          <Badge color="blue">THESIS DEFENSE SIMULATOR</Badge>
          {active && <Clock remaining={remaining ?? seconds} />}
        </div>
        <div className="opponent-argument">
          <div className="eyebrow">YOUR RESOLUTION</div>
          <blockquote>{prompt.text}</blockquote>
        </div>
        {!active && !result && (
          <>
            <button className="text-link mb-6" onClick={newPrompt}>
              <RotateCcw size={14} /> Assign another prompt
            </button>
            <div className="form-two-col">
              <label className="field">
                Your position
                <select
                  value={stance}
                  onChange={(e) => setStance(e.target.value)}
                >
                  <option>Defend</option>
                  <option>Refute</option>
                </select>
              </label>
              <label className="field">
                Required framework
                <select
                  value={framework}
                  onChange={(e) => {
                    setFramework(e.target.value);
                    setFields({});
                  }}
                >
                  <option value="toulmin">Toulmin model</option>
                  <option value="prep">PREP</option>
                </select>
              </label>
            </div>
            <TimerChoice value={seconds} onChange={setSeconds} />
          </>
        )}
        <div className="target-vocabulary">
          <div className="eyebrow">
            {active || result
              ? `${used.length} / 3 TARGET WORDS INCLUDED`
              : "LEARN YOUR THREE TARGET WORDS"}
          </div>
          {targets.map((w) => (
            <div
              key={w.id}
              className={`target-word ${containsWord(text, w.word) ? "used" : ""}`}
            >
              <div>
                <strong>{w.word}</strong>
                <p>{w.definition}</p>
              </div>
              {!active && !result ? (
                <button
                  className="icon-btn"
                  aria-label={`Mark ${w.word} learned`}
                  onClick={() => learn(w.id)}
                  disabled={state.learned.includes(w.id)}
                >
                  {state.learned.includes(w.id) ? (
                    <Check size={17} />
                  ) : (
                    <span className="text-xs font-bold">LEARN</span>
                  )}
                </button>
              ) : (
                containsWord(text, w.word) && <Check size={18} />
              )}
            </div>
          ))}
        </div>
        {!active && !result ? (
          <>
            <Button
              disabled={!ready}
              onClick={() => {
                finished.current = false;
                setActive(true);
                start.current = Date.now();
                setDeadline(Date.now() + seconds * 1000);
              }}
            >
              Start {stance.toLowerCase()} round <ArrowRight size={17} />
            </Button>
            {!ready && (
              <p className="muted text-xs mt-3">
                Read each definition, then mark all three words learned to
                begin.
              </p>
            )}
          </>
        ) : (
          <>
            <div className="round-context">
              <Badge color="neutral">
                {stance} · {structure.name}
              </Badge>
            </div>
            {structure.steps.map((s, i) => (
              <label className="field" key={s}>
                {s}
                <textarea
                  value={fields[i] || ""}
                  maxLength={2000}
                  disabled={!!result}
                  onChange={(e) =>
                    setFields((f) => ({ ...f, [i]: e.target.value }))
                  }
                  placeholder="Build this part of your argument…"
                />
              </label>
            ))}
            {!result ? (
              <>
                <Button
                  disabled={used.length < 3 || !filled}
                  onClick={() => finish(Date.now() >= deadline)}
                >
                  Submit defense <ArrowRight size={17} />
                </Button>
                <p className="muted text-xs mt-3">
                  Use all three exact target words and at least 10 characters
                  per framework step.
                </p>
              </>
            ) : (
              <div className="feedback success" role="status">
                <strong>
                  {result.expired
                    ? "Time is up. Review your draft."
                    : "Defense submitted. Now test the reasoning."}
                </strong>
                <p>
                  {used.length}/3 target words present ·{" "}
                  {
                    structure.steps.filter(
                      (s, i) => (fields[i] || "").trim().length >= 10,
                    ).length
                  }
                  /{structure.steps.length} framework moves present.
                </p>
                <p>
                  This is a structure and vocabulary check, not a judgment of
                  argument quality. Read your response aloud: does each word
                  fit, does the evidence support the claim, and have you
                  addressed a strong objection?
                </p>
                <Button onClick={newPrompt}>
                  <RotateCcw size={16} /> Try a new resolution
                </Button>
              </div>
            )}
          </>
        )}
      </section>
      <aside className="arena-aside">
        <div className="card">
          <span className="icon-tile blue">
            <Mic2 size={23} />
          </span>
          <h3>Speak it before you send it.</h3>
          <p>
            Your target words should make the argument more precise. Use them
            naturally, then listen for rushed phrases and missing connections.
          </p>
          <div className="divider" />
          <h3>{structure.name}</h3>
          <p>{structure.definition}</p>
        </div>
        <div className="notice">
          Typed practice captures the argument. Say each move aloud to train
          delivery alongside reasoning.
        </div>
      </aside>
    </div>
  );
}
function MockDebate() {
  const { state, log, notify } = useApp();
  const [topic, setTopic] = useState(prompts[0].text);
  const [stance, setStance] = useState("Defend");
  const [framework, setFramework] = useState("Toulmin model");
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const controller = useRef(null);
  const pending = useRef(false);
  const started = useRef(Date.now());
  const saved = useRef(0);
  const bottom = useRef();
  const config = {
    topic,
    stance,
    framework,
    targets: initialTargets(state.learned).map((w) => w.word),
  };
  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => {
    if (messages.length)
      bottom.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, busy]);
  const send = async (retry) => {
    if (pending.current) return;
    const outgoing = retry
      ? messages
      : [...messages, { role: "user", content: draft.trim() }];
    if (!retry && !draft.trim()) return;
    setMessages(outgoing);
    setDraft("");
    setError("");
    setBusy(true);
    pending.current = true;
    controller.current = new AbortController();
    try {
      const reply = await getDebateReply({
        messages: outgoing,
        config,
        settings: state.api,
        signal: controller.current.signal,
      });
      setMessages([...outgoing, { role: "assistant", content: reply }]);
    } catch (e) {
      if (e.name !== "AbortError") setError(e.message);
      else setError("Response stopped. Retry when you are ready.");
    } finally {
      pending.current = false;
      setBusy(false);
    }
  };
  const save = () => {
    const turns = messages.filter((m) => m.role === "assistant").length;
    if (turns <= saved.current) return;
    log(
      "arena",
      `${state.api.mode === "mock" ? "Mock" : "API"} debate: ${turns} exchanges`,
      null,
      elapsed(started.current),
    );
    saved.current = turns;
    started.current = Date.now();
    notify("Debate practice saved to your progress");
  };
  const download = () => {
    const blob = new Blob(
      [
        `RHETORIX DEBATE\nTopic: ${topic}\nPosition: ${stance}\nMode: ${state.api.mode}\n\n${messages.map((m) => `${m.role === "user" ? "YOU" : "OPPONENT"}\n${m.content}`).join("\n\n")}`,
      ],
      { type: "text/plain" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rhetorix-debate.txt";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <div className="arena-layout">
      <section className="card chat-card">
        <div className="chat-heading">
          <div>
            <Badge color={state.api.mode === "mock" ? "sage" : "blue"}>
              {state.api.mode === "mock"
                ? "LOCAL MOCK OPPONENT"
                : "CONNECTED API"}
            </Badge>
            <h2>A good argument deserves a challenge.</h2>
          </div>
          <MessageSquare size={27} />
        </div>
        <div className="chat-config">
          <label className="field">
            Resolution
            <select
              disabled={messages.length > 0}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            >
              {prompts.map((p) => (
                <option key={p.id}>{p.text}</option>
              ))}
            </select>
          </label>
          <div className="form-two-col">
            <label className="field">
              Your position
              <select
                disabled={messages.length > 0}
                value={stance}
                onChange={(e) => setStance(e.target.value)}
              >
                <option>Defend</option>
                <option>Refute</option>
              </select>
            </label>
            <label className="field">
              Framework
              <select
                disabled={messages.length > 0}
                value={framework}
                onChange={(e) => setFramework(e.target.value)}
              >
                <option>Toulmin model</option>
                <option>PREP</option>
              </select>
            </label>
          </div>
        </div>
        <div
          className="chat-messages"
          aria-live="polite"
          aria-label="Debate conversation"
        >
          {!messages.length && (
            <div className="chat-empty">
              <span className="icon-tile sage">
                <Mic2 size={25} />
              </span>
              <h3>The floor is yours.</h3>
              <p>
                State your opening case. Your opponent will test its
                assumptions.
              </p>
            </div>
          )}
          {messages.map((m, i) => (
            <div className={`chat-message ${m.role}`} key={i}>
              <span>
                {m.role === "user"
                  ? "YOU"
                  : state.api.mode === "mock"
                    ? "PRACTICE OPPONENT"
                    : "AI OPPONENT"}
              </span>
              <p>{m.content}</p>
            </div>
          ))}
          {busy && (
            <p className="muted text-sm">
              Your opponent is considering your argument…
            </p>
          )}
          <div ref={bottom} />
        </div>
        {error && (
          <div className="notice warning" role="alert">
            <span>{error}</span>
            <Button
              variant="secondary"
              disabled={busy}
              onClick={() => send(true)}
            >
              Retry response
            </Button>
          </div>
        )}
        <form
          className="chat-compose"
          onSubmit={(e) => {
            e.preventDefault();
            send(false);
          }}
        >
          <label className="sr-only" htmlFor="debate-message">
            Your argument
          </label>
          <textarea
            id="debate-message"
            placeholder="Make your case…"
            maxLength={4000}
            value={draft}
            disabled={busy || !!error}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                send(false);
              }
            }}
          />
          {busy ? (
            <button
              type="button"
              className="icon-btn send-btn"
              aria-label="Stop response"
              onClick={() => controller.current?.abort()}
            >
              <Square size={17} />
            </button>
          ) : (
            <button
              type="submit"
              className="icon-btn send-btn"
              aria-label="Send argument"
              disabled={!draft.trim() || !!error}
            >
              <Send size={18} />
            </button>
          )}
        </form>
        <div className="chat-actions">
          <Button
            variant="secondary"
            disabled={busy || !messages.some((m) => m.role === "assistant")}
            onClick={save}
          >
            Save practice
          </Button>
          <button
            className="text-link"
            disabled={!messages.length}
            onClick={download}
          >
            <Download size={15} /> Transcript
          </button>
          <button
            className="text-link"
            disabled={busy || !messages.length}
            onClick={() => {
              save();
              setMessages([]);
              setError("");
              saved.current = 0;
              started.current = Date.now();
            }}
          >
            New debate
          </button>
        </div>
      </section>
      <aside className="arena-aside">
        <div className="card">
          <h3>
            {state.api.mode === "mock"
              ? "A partner for practice"
              : "Your connected opponent"}
          </h3>
          <p>
            {state.api.mode === "mock"
              ? "This local mock engine uses rotating critical-thinking prompts and your last message. It does not evaluate facts or generate intelligent rebuttals."
              : "Replies come from the same-origin endpoint configured in Settings."}
          </p>
          <p>
            For a model-generated debate, connect your backend in Settings. Keep
            provider keys on that server.
          </p>
          <div className="divider" />
          <div className="eyebrow">MAKE EACH TURN COUNT</div>
          <ol>
            <li>Answer the objection directly.</li>
            <li>Give a reason and a concrete example.</li>
            <li>Ask one focused question.</li>
          </ol>
        </div>
        <details className="card prompt-details">
          <summary>Preview the opponent prompt</summary>
          <pre>{buildDebatePrompt(config)}</pre>
        </details>
      </aside>
    </div>
  );
}
