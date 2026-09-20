import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Layers,
  Mic2,
  Flame,
  Target,
  Check,
  Quote,
  Clock3,
  Sparkles,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { words, deck, curriculum } from "../data";
import { dateKey, dateOrdinal, currentWeek, streak } from "../lib/engine";
import { Badge, Button, SectionHeading, ProgressBar } from "./UI";
function VoiceArtwork() {
  return (
    <svg className="voice-art" viewBox="0 0 380 300" aria-hidden="true">
      <defs>
        <pattern id="lines" width="9" height="9" patternUnits="userSpaceOnUse">
          <path d="M0 0V9" stroke="#6b8175" strokeWidth="1" />
        </pattern>
      </defs>
      <circle
        cx="221"
        cy="126"
        r="99"
        fill="none"
        stroke="#718276"
        opacity=".35"
      />
      <circle
        cx="221"
        cy="126"
        r="83"
        fill="none"
        stroke="#718276"
        opacity=".4"
      />
      <path d="M117 285V147a90 90 0 0 1 180 0v138" fill="#e7b292" />
      <path d="M149 285V153a58 58 0 0 1 116 0v132" fill="#20352c" />
      <path d="M149 285V153a58 58 0 0 1 116 0v132" fill="url(#lines)" />
      <rect x="79" y="180" width="185" height="6" rx="3" fill="#f3dfb9" />
      <rect x="96" y="198" width="153" height="6" rx="3" fill="#f3dfb9" />
      <rect x="115" y="216" width="116" height="6" rx="3" fill="#f3dfb9" />
      <circle cx="291" cy="98" r="35" fill="#ed7548" />
      <path
        d="M278 102v-10h9v10h-5c0 5-2 8-6 10m18-10v-10h9v10h-5c0 5-2 8-6 10"
        stroke="#20352c"
        strokeWidth="3"
        fill="none"
      />
      <path
        d="M92 91h20m-10-10v20M309 228h24m-12-12v24"
        stroke="#b4c2a6"
        strokeWidth="2"
      />
      <circle cx="90" cy="143" r="3" fill="#b4c2a6" />
      <path d="M79 286h248" stroke="#7e9385" />
    </svg>
  );
}
export default function Dashboard({ navigate, clock }) {
  const { state } = useApp();
  const now = new Date(clock);
  const today = state.events.filter((e) => e.date === dateKey(now));
  const week = currentWeek(state, now);
  const lesson =
    curriculum.find((l) => !state.completed.includes(l.id)) || curriculum[15];
  const word = words[dateOrdinal(dateKey(now)) % words.length];
  const due = deck.filter((c) => state.cards[c.id]?.due <= clock).length;
  const scored = state.events.filter(
    (e) => e.kind === "drill" && e.score !== null,
  );
  const accuracy = scored.length
    ? Math.round(scored.reduce((s, e) => s + e.score, 0) / scored.length)
    : null;
  const minutes = Math.floor(today.reduce((s, e) => s + e.seconds, 0) / 60);
  const steps = [
    {
      icon: Layers,
      title: "Make it stick",
      description: due
        ? `${due} cards ready for review`
        : "Build your first review deck",
      time: "10 min",
      page: "flashcards",
      kind: "review",
    },
    {
      icon: BookOpen,
      title: lesson.title,
      description: `Week ${lesson.week} · ${lesson.focus}`,
      time: "20 min",
      page: "curriculum",
      kind: "lesson",
    },
    {
      icon: Mic2,
      title: "Put your thinking to the test",
      description: "Spot a fallacy. Build a better response.",
      time: "15 min",
      page: "arena",
      kind: "arena",
    },
  ];
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            {now.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </div>
          <h1>Your next chapter starts here.</h1>
          <p>A sharper mind. A stronger voice. One deliberate day at a time.</p>
        </div>
        <Badge color="neutral">
          <span className="status-dot" /> WEEK {week} OF 16
        </Badge>
      </div>
      <section className="hero">
        <div className="hero-content">
          <span className="hero-kicker">
            <span /> YOUR VOICE IS A WORK IN PROGRESS
          </span>
          <h2>
            Think clearly.
            <br />
            Speak <em>convincingly.</em>
          </h2>
          <p>
            Turn good ideas into words that move people.
            <br className="desktop-only" /> Your four-month transformation
            starts with today.
          </p>
          <Button onClick={() => navigate("flashcards")}>
            Start today’s practice <ArrowRight size={17} />
          </Button>
          <span className="hero-meta">
            <Clock3 size={13} /> {state.dailyGoal} minutes. A meaningful step
            forward.
          </span>
        </div>
        <VoiceArtwork />
        <div className="hero-index">01 — THE ART OF BEING HEARD</div>
      </section>
      <div className="stat-grid">
        {[
          {
            label: "Daily streak",
            value: streak(state.events, now),
            unit: "days",
            icon: Flame,
            hint: "Consistency builds confidence",
            color: "peach",
          },
          {
            label: "Active vocabulary",
            value: state.learned.length,
            unit: "words",
            icon: BookOpen,
            hint: `${words.length} words waiting to be explored`,
            color: "sage",
          },
          {
            label: "Quiz accuracy",
            value: accuracy === null ? "—" : `${accuracy}%`,
            unit: "",
            icon: Target,
            hint: scored.length
              ? `Across ${scored.length} completed drills`
              : "Your first drill sets the baseline",
            color: "lavender",
          },
          {
            label: "Curriculum progress",
            value: state.completed.length,
            unit: "/ 16",
            icon: Layers,
            hint: "Small lessons. Lasting foundations.",
            color: "blue",
          },
        ].map(({ label, value, unit, icon: Icon, hint, color }) => (
          <div className="stat-card" key={label}>
            <div className="stat-top">
              <span>{label}</span>
              <span className={`icon-tile ${color}`}>
                <Icon size={18} />
              </span>
            </div>
            <div className="stat-value">
              {value}
              <span>{unit}</span>
            </div>
            <p>{hint}</p>
          </div>
        ))}
      </div>
      <div className="dashboard-columns">
        <section>
          <SectionHeading
            title="Your daily practice"
            action="View progress"
            onClick={() => navigate("progress")}
          />
          <div className="card daily-plan">
            <div className="daily-plan-head">
              <div>
                <Badge color="sage">A LITTLE, EVERY DAY</Badge>
                <h3>A plan for a more powerful voice.</h3>
              </div>
              <div className="daily-total">
                <strong>
                  {minutes}
                  <span> / {state.dailyGoal}</span>
                </strong>
                <span>MINUTES TODAY</span>
              </div>
            </div>
            <ProgressBar
              value={(minutes / state.dailyGoal) * 100}
              label="Daily practice progress"
            />
            {steps.map(
              ({ icon: Icon, title, description, time, page, kind }, i) => {
                const done = today.some((e) => e.kind === kind);
                return (
                  <button
                    key={title}
                    className="practice-row"
                    onClick={() => navigate(page)}
                  >
                    <span className={`practice-number ${done ? "done" : ""}`}>
                      {done ? (
                        <Check size={17} />
                      ) : (
                        String(i + 1).padStart(2, "0")
                      )}
                    </span>
                    <span className="practice-info">
                      <strong>{title}</strong>
                      <span>{description}</span>
                    </span>
                    <span className="practice-time">{time}</span>
                    <ArrowUpRight size={18} />
                  </button>
                );
              },
            )}
            <div className="plan-foot">
              <Sparkles size={14} /> Practice aloud whenever you can. Your voice
              is part of the work.
            </div>
          </div>
        </section>
        <section>
          <SectionHeading title="A word worth knowing" />
          <div className="word-feature">
            <div className="flex justify-between items-center">
              <Badge color="peach">WORD OF THE DAY</Badge>
              <Quote size={23} strokeWidth={1.4} />
            </div>
            <h3>{word.word}</h3>
            <span className="word-pos">
              {word.partOfSpeech} · {word.category.toLowerCase()}
            </span>
            <p>{word.definition}</p>
            <blockquote>“{word.example}”</blockquote>
            <button className="text-link" onClick={() => navigate("lexicon")}>
              Explore the lexicon <ArrowUpRight size={17} />
            </button>
          </div>
        </section>
      </div>
      <SectionHeading
        title="The bigger picture"
        action="Explore your roadmap"
        onClick={() => navigate("curriculum")}
      />
      <div className="roadmap-banner">
        <div className="roadmap-icon">
          <BookOpen size={24} />
        </div>
        <div>
          <div className="eyebrow">UP NEXT · WEEK {lesson.week}</div>
          <h3>{lesson.title}</h3>
          <p>
            {lesson.focus} · Build the skills that every strong argument rests
            on.
          </p>
        </div>
        <Button variant="secondary" onClick={() => navigate("curriculum")}>
          Continue learning <ArrowRight size={16} />
        </Button>
      </div>
    </>
  );
}
