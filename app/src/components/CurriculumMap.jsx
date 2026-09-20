import { useRef, useState } from "react";
import {
  Check,
  ArrowUpRight,
  ArrowRight,
  BookOpen,
  Clock3,
  Flag,
} from "lucide-react";
import { curriculum, months, readings } from "../data";
import { currentWeek } from "../lib/engine";
import { useApp } from "../context/AppContext";
import { Badge, Button, CheckItem, PageHeading, ProgressBar } from "./UI";
export default function CurriculumMap() {
  const { state, setState, complete } = useApp();
  const first =
    curriculum.find((l) => !state.completed.includes(l.id)) || curriculum[15];
  const [month, setMonth] = useState(first.month);
  const [selected, setSelected] = useState(first.id);
  const detail = useRef();
  const lesson = curriculum.find((l) => l.id === selected);
  const book = readings.find((r) => r.id === lesson.readingId);
  return (
    <>
      <PageHeading
        eyebrow="THE FOUR-MONTH ROADMAP"
        title="A stronger voice, by design."
        description="Sixteen weeks of deliberate practice. From the first clear claim to a confident closing."
        action={<Badge>{state.completed.length} / 16 WEEKS COMPLETE</Badge>}
      />
      <div className="month-grid">
        {months.map((m, i) => (
          <button
            className={`month-card ${m.color} ${month === i + 1 ? "selected" : ""}`}
            key={m.name}
            onClick={() => {
              setMonth(i + 1);
              setSelected(curriculum[i * 4].id);
            }}
            aria-pressed={month === i + 1}
          >
            <div className="eyebrow">
              MONTH {String(i + 1).padStart(2, "0")}{" "}
              <span>
                W{i * 4 + 1}–{i * 4 + 4}
              </span>
            </div>
            <h2>{m.name}</h2>
            <p>{m.description}</p>
            <div className="month-progress">
              {curriculum
                .filter((l) => l.month === i + 1)
                .map((l) => (
                  <span
                    className={state.completed.includes(l.id) ? "complete" : ""}
                    key={l.id}
                  />
                ))}
            </div>
          </button>
        ))}
      </div>
      <div className="section-heading">
        <div>
          <div className="eyebrow">MONTH {month}</div>
          <h2>{months[month - 1].subtitle}</h2>
        </div>
        <span className="muted text-sm">
          45 minutes a day · 5 practice days a week
        </span>
      </div>
      <div className="week-grid">
        {curriculum
          .filter((l) => l.month === month)
          .map((l) => (
            <button
              className={`card week-card ${selected === l.id ? "selected" : ""}`}
              key={l.id}
              onClick={() => {
                setSelected(l.id);
                setTimeout(
                  () =>
                    detail.current?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    }),
                  50,
                );
              }}
            >
              <div className="flex justify-between items-center">
                <span className="eyebrow">
                  WEEK {String(l.week).padStart(2, "0")}
                </span>
                {state.completed.includes(l.id) ? (
                  <Check size={18} />
                ) : (
                  <ArrowUpRight size={18} />
                )}
              </div>
              <h3>{l.title}</h3>
              <p>{l.focus}</p>
              <span className="week-state">
                {state.completed.includes(l.id)
                  ? "Completed"
                  : l.week === currentWeek(state)
                    ? "This calendar week"
                    : "Open lesson"}{" "}
                <ArrowRight size={14} />
              </span>
            </button>
          ))}
      </div>
      <article className="card lesson-detail" ref={detail}>
        <div className="lesson-header">
          <div>
            <Badge>
              WEEK {lesson.week} · {lesson.focus}
            </Badge>
            <h2>{lesson.title}</h2>
          </div>
          <BookOpen size={34} strokeWidth={1.3} />
        </div>
        <div className="lesson-columns">
          <div>
            <h3>What you’ll be able to do</h3>
            {lesson.objectives.map((o) => (
              <CheckItem key={o}>{o}</CheckItem>
            ))}
            <h3>The lesson</h3>
            {lesson.lesson.map((n) => (
              <p key={n}>{n}</p>
            ))}
            <h3>Put it into practice</h3>
            <ol className="practice-list">
              {lesson.practice.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ol>
            <div className="checkpoint">
              <Flag size={19} />
              <div>
                <strong>Your weekly checkpoint</strong>
                <p>{lesson.assessment}</p>
              </div>
            </div>
          </div>
          <aside>
            <div className="reading-card">
              <div className="eyebrow">ESSENTIAL READING</div>
              <h3>{book.title}</h3>
              <span className="muted text-sm">{book.author}</span>
              <p>{book.summary}</p>
              <div className="reading-focus">
                <strong>This week’s reading lens</strong>
                <p>{lesson.readingFocus}</p>
              </div>
              <a
                className="text-link"
                href={book.url}
                target="_blank"
                rel="noreferrer"
              >
                {book.id === "schopenhauer"
                  ? "Read public-domain text"
                  : "Book & edition details"}
                <ArrowUpRight size={15} />
              </a>
            </div>
            <div className="daily-rhythm">
              <h3>
                <Clock3 size={17} /> Your daily rhythm
              </h3>
              {lesson.dailyPlan.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </aside>
        </div>
        <label className="field">
          Your practice notes
          <textarea
            value={state.notes[lesson.id] || ""}
            maxLength={10000}
            placeholder="What clicked? What do you want to try next time?"
            onChange={(e) =>
              setState((s) => ({
                ...s,
                notes: { ...s.notes, [lesson.id]: e.target.value },
              }))
            }
          />
        </label>
        <div className="lesson-footer">
          <p className="muted text-sm">
            Complete the checkpoint before marking the week done.
          </p>
          <Button
            disabled={state.completed.includes(lesson.id)}
            onClick={() => complete(lesson.id)}
          >
            <Check size={17} />
            {state.completed.includes(lesson.id)
              ? "Week completed"
              : "Mark week complete"}
          </Button>
        </div>
        <p className="source-note">
          Rhetorix lessons and exercises are original. Reading lenses connect
          the practice to each book’s themes; they are not chapter summaries or
          quotations. Chapter numbering varies by edition. Schopenhauer is
          studied to recognize and counter disputation tactics.
        </p>
      </article>
    </>
  );
}
