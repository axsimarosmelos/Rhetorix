import test from "node:test";
import assert from "node:assert/strict";
import {
  addMonths,
  newState,
  validateState,
  scheduleCard,
  streak,
  daysLeft,
  dateKey,
  dateOrdinal,
  makeQueue,
  containsWord,
  normalize,
  DAY,
} from "../src/lib/engine.js";
const now = Date.UTC(2026, 8, 20, 12);
test("four calendar months and month-end dates are preserved correctly", () => {
  assert.equal(dateKey(addMonths(new Date(2026, 0, 31, 12), 1)), "2026-02-28");
  assert.equal(newState(new Date(2026, 8, 20, 12)).targetDate, "2027-01-20");
});
test("countdown compares calendar dates, not elapsed hours", () => {
  assert.equal(daysLeft("2026-09-22", new Date(2026, 8, 20, 23, 59)), 2);
  assert.equal(daysLeft("2026-09-19", new Date(2026, 8, 20)), 0);
  assert.equal(dateOrdinal("2026-03-09") - dateOrdinal("2026-03-08"), 1);
});
test("streak includes yesterday until today is practiced, ignores duplicates, and stops at gaps", () => {
  const n = new Date(2026, 8, 20, 12);
  assert.equal(
    streak(
      [{ date: "2026-09-18" }, { date: "2026-09-19" }, { date: "2026-09-19" }],
      n,
    ),
    2,
  );
  assert.equal(streak([{ date: "2026-09-18" }], n), 0);
  assert.equal(streak([{ date: "2026-09-18" }, { date: "2026-09-20" }], n), 1);
});
test("successful recalls expand intervals and Again schedules a ten-minute relearn", () => {
  const first = scheduleCard(undefined, "good", now);
  assert.equal(first.interval, 1);
  assert.equal(first.due, now + DAY);
  const second = scheduleCard(first, "good", now + DAY);
  assert.equal(second.interval, 3);
  const third = scheduleCard(second, "good", now + 4 * DAY);
  assert.equal(third.interval, 8);
  const lapse = scheduleCard(third, "again", now);
  assert.equal(lapse.due, now + 600000);
  assert.equal(lapse.reps, 0);
  assert.equal(lapse.lapses, 1);
  assert.equal(scheduleCard(lapse, "good", now).interval, 1);
});
test("Hard remains shorter than Good on mature cards; intervals and ease are bounded", () => {
  const c = { interval: 20, reps: 4, ease: 2.5, lapses: 0, due: now };
  assert.ok(
    scheduleCard(c, "hard", now).interval <
      scheduleCard(c, "good", now).interval,
  );
  assert.equal(
    scheduleCard({ ...c, interval: 3650 }, "easy", now).interval,
    3650,
  );
  assert.equal(scheduleCard({ ...c, ease: 1.3 }, "again", now).ease, 1.3);
  assert.throws(() => scheduleCard(c, "invalid", now));
});
test("queue prioritizes overdue cards and excludes future cards", () => {
  const deck = [
    { id: "new", type: "Roots" },
    { id: "later", type: "Roots" },
    { id: "due", type: "Roots" },
    { id: "old", type: "Vocabulary" },
  ];
  const cards = {
    later: { due: now + 1 },
    due: { due: now },
    old: { due: now - 10 },
  };
  assert.deepEqual(
    makeQueue(deck, cards, "All", now, 10).map((c) => c.id),
    ["old", "due", "new"],
  );
  assert.deepEqual(
    makeQueue(deck, cards, "Roots", now, 1).map((c) => c.id),
    ["due"],
  );
});
test("vocabulary detection matches complete words, not misleading substrings", () => {
  assert.equal(containsWord("A CREDIBLE, tenable response.", "credible"), true);
  assert.equal(containsWord("An incredible claim.", "credible"), false);
  assert.equal(containsWord("Credible—yet incomplete.", "credible"), true);
  assert.equal(normalize("  Eloquent!  "), "eloquent");
});
test("backup validation accepts a round trip and rejects corrupt dates, scores, and schedules", () => {
  const state = newState(new Date(2026, 8, 20));
  assert.deepEqual(validateState(JSON.parse(JSON.stringify(state))), state);
  for (const patch of [
    { version: 2 },
    { targetDate: "2026-02-30" },
    { targetDate: state.startDate },
    { dailyGoal: -1 },
    { learned: "word" },
    { api: { mode: "api", endpoint: "https://example.com" } },
    { cards: { x: { due: now, ease: 2.5, reps: 0, interval: -1, lapses: 0 } } },
    {
      events: [
        {
          date: "2026-09-20",
          kind: "drill",
          label: "x",
          seconds: 10,
          score: 101,
        },
      ],
    },
  ])
    assert.throws(() => validateState({ ...state, ...patch }));
});
test("backup validation rejects dangerous object keys", () => {
  const s = newState();
  s.notes = JSON.parse('{"__proto__":"bad"}');
  assert.throws(() => validateState(s));
});

test("backup catalog validation rejects references to missing educational content", () => {
  const state = newState();
  const catalog = {
    learned: new Set(["credible"]),
    bookmarks: new Set(),
    completed: new Set(["week-1"]),
    cards: new Set(),
  };
  assert.doesNotThrow(() =>
    validateState({ ...state, learned: ["credible"] }, catalog),
  );
  assert.throws(() =>
    validateState({ ...state, learned: ["unknown-word"] }, catalog),
  );
  assert.throws(() =>
    validateState({ ...state, notes: { "week-99": "bad reference" } }, catalog),
  );
});
