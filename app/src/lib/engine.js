export const STORAGE_KEY = "rhetorix.v1";
export const DAY = 86400000;
export function dateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function dateOrdinal(key) {
  const [y, m, d] = key.split("-").map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / DAY);
}
export function validDate(value) {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    dateKey(new Date(`${value}T12:00:00`)) === value
  );
}
export function addMonths(date, months) {
  const next = new Date(date);
  const day = next.getDate();
  next.setDate(1);
  next.setMonth(next.getMonth() + months);
  const last = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
  next.setDate(Math.min(day, last));
  return next;
}
export function newState(now = new Date()) {
  return {
    version: 1,
    startDate: dateKey(now),
    targetDate: dateKey(addMonths(now, 4)),
    name: "Speaker",
    dailyGoal: 45,
    learned: [],
    bookmarks: [],
    completed: [],
    notes: {},
    cards: {},
    events: [],
    api: { mode: "mock", endpoint: "/api/debate" },
  };
}
export function validateState(value, catalog) {
  const fail = () => {
    throw new Error(
      "This is not a valid Rhetorix v1 backup. Your current progress has not changed.",
    );
  };
  if (
    !value ||
    value.version !== 1 ||
    !validDate(value.startDate) ||
    !validDate(value.targetDate) ||
    dateOrdinal(value.targetDate) <= dateOrdinal(value.startDate)
  )
    fail();
  const id = (x) =>
    typeof x === "string" &&
    x.length < 100 &&
    !["__proto__", "constructor", "prototype"].includes(x);
  for (const key of ["learned", "bookmarks", "completed"])
    if (
      !Array.isArray(value[key]) ||
      value[key].length > 1000 ||
      !value[key].every(id)
    )
      fail();
  if (
    !Number.isInteger(value.dailyGoal) ||
    value.dailyGoal < 5 ||
    value.dailyGoal > 180 ||
    typeof value.name !== "string" ||
    value.name.length > 40
  )
    fail();
  if (
    !value.cards ||
    Array.isArray(value.cards) ||
    typeof value.cards !== "object" ||
    Object.keys(value.cards).length > 2000
  )
    fail();
  for (const [key, c] of Object.entries(value.cards))
    if (
      !id(key) ||
      !c ||
      !Number.isFinite(c.due) ||
      c.due < 0 ||
      !Number.isFinite(c.ease) ||
      c.ease < 1.3 ||
      c.ease > 3 ||
      !Number.isInteger(c.reps) ||
      c.reps < 0 ||
      !Number.isFinite(c.interval) ||
      c.interval < 0 ||
      c.interval > 3650 ||
      !Number.isInteger(c.lapses) ||
      c.lapses < 0
    )
      fail();
  if (
    !Array.isArray(value.events) ||
    value.events.length > 10000 ||
    !value.events.every(
      (e) =>
        e &&
        validDate(e.date) &&
        ["review", "drill", "arena", "lesson", "learn"].includes(e.kind) &&
        typeof e.label === "string" &&
        e.label.length < 300 &&
        Number.isFinite(e.seconds) &&
        e.seconds >= 0 &&
        e.seconds <= 86400 &&
        (e.score === null ||
          (Number.isFinite(e.score) && e.score >= 0 && e.score <= 100)),
    )
  )
    fail();
  if (
    !value.notes ||
    typeof value.notes !== "object" ||
    Array.isArray(value.notes) ||
    !Object.entries(value.notes).every(
      ([k, v]) => id(k) && typeof v === "string" && v.length <= 10000,
    )
  )
    fail();
  if (
    !value.api ||
    !["mock", "api"].includes(value.api.mode) ||
    typeof value.api.endpoint !== "string" ||
    !/^\/(?!\/)[a-zA-Z0-9/_-]*$/.test(value.api.endpoint)
  )
    fail();
  // A valid shape must also reference the content installed in this app.
  if (catalog) {
    for (const key of ["learned", "bookmarks", "completed"])
      if (!value[key].every((item) => catalog[key].has(item))) fail();
    if (!Object.keys(value.notes).every((key) => catalog.completed.has(key)))
      fail();
    if (!Object.keys(value.cards).every((key) => catalog.cards.has(key)))
      fail();
  }
  return {
    version: 1,
    startDate: value.startDate,
    targetDate: value.targetDate,
    name: value.name,
    dailyGoal: value.dailyGoal,
    learned: [...new Set(value.learned)],
    bookmarks: [...new Set(value.bookmarks)],
    completed: [...new Set(value.completed)],
    notes: { ...value.notes },
    cards: { ...value.cards },
    events: value.events,
    api: { ...value.api },
  };
}
export function scheduleCard(previous, rating, now = Date.now()) {
  if (!["again", "hard", "good", "easy"].includes(rating))
    throw new Error("Unknown rating");
  const c = previous || {
    interval: 0,
    ease: 2.5,
    reps: 0,
    lapses: 0,
    due: now,
  };
  if (rating === "again")
    return {
      ...c,
      interval: 0,
      reps: 0,
      lapses: c.lapses + 1,
      ease: Math.max(1.3, c.ease - 0.2),
      due: now + 600000,
    };
  let interval;
  if (rating === "hard") interval = Math.max(1, Math.round(c.interval * 1.2));
  else if (rating === "easy")
    interval =
      c.reps === 0 ? 4 : Math.max(4, Math.round(c.interval * c.ease * 1.3));
  else
    interval =
      c.reps === 0
        ? 1
        : c.reps === 1
          ? 3
          : Math.max(1, Math.round(c.interval * c.ease));
  interval = Math.min(3650, interval);
  return {
    ...c,
    interval,
    reps: c.reps + 1,
    ease: Math.min(
      3,
      Math.max(
        1.3,
        c.ease + (rating === "easy" ? 0.15 : rating === "hard" ? -0.15 : 0),
      ),
    ),
    due: now + interval * DAY,
  };
}
export function streak(events, now = new Date()) {
  const days = new Set(events.map((e) => dateOrdinal(e.date)));
  let day = dateOrdinal(dateKey(now));
  if (!days.has(day)) day--;
  let count = 0;
  while (days.has(day--)) count++;
  return count;
}
export function daysLeft(target, now = new Date()) {
  return Math.max(0, dateOrdinal(target) - dateOrdinal(dateKey(now)));
}
export function currentWeek(state, now = new Date()) {
  return Math.min(
    16,
    Math.max(
      1,
      Math.floor(
        (dateOrdinal(dateKey(now)) - dateOrdinal(state.startDate)) / 7,
      ) + 1,
    ),
  );
}
export function normalize(text) {
  return text
    .toLocaleLowerCase()
    .trim()
    .replace(/[.!?,;:]+$/g, "")
    .replace(/\s+/g, " ");
}
export function containsWord(text, word) {
  return text
    .toLocaleLowerCase()
    .split(/[^\p{L}]+/u)
    .includes(word.toLocaleLowerCase());
}
export function shuffle(items) {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export function makeQueue(
  deck,
  cards,
  filter = "All",
  now = Date.now(),
  limit = 10,
) {
  const choices = deck.filter((c) => filter === "All" || c.type === filter);
  const due = choices
    .filter((c) => cards[c.id] && cards[c.id].due <= now)
    .sort((a, b) => cards[a.id].due - cards[b.id].due);
  const unseen = choices.filter((c) => !cards[c.id]);
  return [...due, ...unseen].slice(0, limit);
}
