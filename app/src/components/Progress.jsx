import {
  Flame,
  Target,
  BookOpen,
  Clock3,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { dateKey, streak, daysLeft, DAY } from "../lib/engine";
import { deck, words } from "../data";
import { Badge, Empty, PageHeading, ProgressBar, SectionHeading } from "./UI";
export default function Progress({ clock }) {
  const { state } = useApp();
  const now = new Date(clock);
  const scored = state.events.filter(
    (e) => e.kind === "drill" && e.score !== null,
  );
  const accuracy = scored.length
    ? Math.round(scored.reduce((s, e) => s + e.score, 0) / scored.length)
    : null;
  const seconds = state.events.reduce((s, e) => s + e.seconds, 0);
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - 13 + i);
    const key = dateKey(d);
    const events = state.events.filter((e) => e.date === key);
    return {
      key,
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      minutes:
        Math.round((events.reduce((s, e) => s + e.seconds, 0) / 60) * 10) / 10,
      count: events.length,
    };
  });
  const max = Math.max(state.dailyGoal, ...days.map((d) => d.minutes));
  const recent = [...state.events].reverse().slice(0, 12);
  const retained = Object.values(state.cards).filter(
    (c) => c.interval >= 21,
  ).length;
  const totalReviewed = Object.keys(state.cards).length;
  const due = deck.filter((c) => state.cards[c.id]?.due <= clock).length;
  const lastScores = scored.slice(-8);
  return (
    <>
      <PageHeading
        eyebrow="EVIDENCE OF YOUR EFFORT"
        title="Progress you can build on."
        description="Measure the practice. Notice the patterns. Keep showing up."
        action={
          <Badge color="peach">
            {daysLeft(state.targetDate, now)} DAYS TO GO
          </Badge>
        }
      />
      <div className="stat-grid">
        {[
          {
            label: "Current streak",
            value: streak(state.events, now),
            suffix: "days",
            icon: Flame,
          },
          {
            label: "Quiz average",
            value: accuracy === null ? "—" : accuracy,
            suffix: accuracy === null ? "" : "%",
            icon: Target,
          },
          {
            label: "Words learned",
            value: state.learned.length,
            suffix: `/ ${words.length}`,
            icon: BookOpen,
          },
          {
            label: "Timed practice",
            value: Math.floor(seconds / 60),
            suffix: "min",
            icon: Clock3,
          },
        ].map(({ label, value, suffix, icon: Icon }) => (
          <div className="stat-card" key={label}>
            <div className="stat-top">
              <span>{label}</span>
              <Icon size={18} />
            </div>
            <div className="stat-value">
              {value}
              <span>{suffix}</span>
            </div>
            <p>
              {label === "Quiz average"
                ? `${scored.length} completed quizzes`
                : "Built from your actual activity"}
            </p>
          </div>
        ))}
      </div>
      <div className="progress-columns">
        <section className="card chart-card">
          <SectionHeading title="Keep the rhythm" />
          <div className="flex justify-between items-center mb-8">
            <p className="muted text-sm">Timed practice · last 14 days</p>
            <Badge color="neutral">GOAL: {state.dailyGoal} MIN / DAY</Badge>
          </div>
          <div
            className="activity-chart"
            role="img"
            aria-label={days
              .map((d) => `${d.label}: ${d.minutes} minutes`)
              .join("; ")}
          >
            {days.map((d) => (
              <div
                className="activity-column"
                key={d.key}
                title={`${d.label}: ${d.minutes} minutes, ${d.count} activities`}
              >
                <span className="activity-value">
                  {d.minutes > 0 ? d.minutes : ""}
                </span>
                <div className="activity-bar-space">
                  <div
                    className={`activity-bar ${d.minutes >= state.dailyGoal ? "goal-met" : ""}`}
                    style={{
                      height: `${Math.max(2, (d.minutes / max) * 100)}%`,
                    }}
                  />
                </div>
                <span>{d.label.split(" ")[1]}</span>
              </div>
            ))}
          </div>
          <div className="chart-axis">
            <span>{days[0].label}</span>
            <span>{days[13].label}</span>
          </div>
          <p className="source-note">
            Minutes count timed drills, card reviews, and saved debate sessions.
            Reading and delivery practice outside those timers are not counted.
          </p>
        </section>
        <section className="card retention-card">
          <span className="icon-tile sage">
            <TrendingUp size={23} />
          </span>
          <h2>Learning that lasts.</h2>
          <p>
            {totalReviewed} distinct cards reviewed across vocabulary, roots,
            and techniques.
          </p>
          <div className="retention-stat">
            <strong>{retained}</strong>
            <span>
              cards with a review interval
              <br />
              of at least 21 days
            </span>
          </div>
          <ProgressBar
            value={totalReviewed ? (retained / totalReviewed) * 100 : 0}
            label="Long interval cards"
          />
          <div className="flex justify-between mt-5 text-sm">
            <span className="muted">Ready to review</span>
            <strong>{due} cards</strong>
          </div>
          <div className="flex justify-between mt-3 text-sm">
            <span className="muted">Curriculum complete</span>
            <strong>{state.completed.length} / 16 weeks</strong>
          </div>
        </section>
      </div>
      <div className="progress-columns">
        <section className="card chart-card">
          <SectionHeading title="Your quiz results" />
          {lastScores.length ? (
            <div className="quiz-results">
              {lastScores.map((e, i) => (
                <div className="quiz-result" key={i}>
                  <div>
                    <strong>{e.label}</strong>
                    <span>{e.date}</span>
                  </div>
                  <ProgressBar value={e.score} label={`${e.label} score`} />
                  <b>{Math.round(e.score)}%</b>
                </div>
              ))}
            </div>
          ) : (
            <Empty title="Your baseline starts here">
              Complete a lexicon drill to see your score. Future sessions will
              show how your accuracy changes.
            </Empty>
          )}
        </section>
        <section className="card activity-log">
          <SectionHeading title="Recent practice" />
          {recent.length ? (
            <div>
              {recent.map((e, i) => (
                <div className="activity-log-row" key={i}>
                  <span className="activity-dot" />
                  <div>
                    <strong>{e.label}</strong>
                    <span>
                      {e.date}
                      {e.seconds > 0
                        ? ` · ${Math.round(e.seconds)} seconds`
                        : ""}
                    </span>
                  </div>
                  {e.score !== null && <b>{e.score}%</b>}
                </div>
              ))}
            </div>
          ) : (
            <Empty title="A blank page, full of possibility">
              Learn a word, complete a lesson, or start your first practice
              session.
            </Empty>
          )}
        </section>
      </div>
    </>
  );
}
