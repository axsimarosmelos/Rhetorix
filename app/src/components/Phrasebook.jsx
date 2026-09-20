import { useState } from "react";
import { Bookmark, Check, Copy, Search, Quote } from "lucide-react";
import { phrases } from "../data";
import { useApp } from "../context/AppContext";
import { Badge, Empty, PageHeading } from "./UI";
export default function Phrasebook() {
  const { state, toggleBookmark, notify } = useApp();
  const [category, setCategory] = useState("All phrases");
  const [query, setQuery] = useState("");
  const categories = [
    "All phrases",
    ...new Set(phrases.map((p) => p.category)),
    "Saved",
  ];
  const found = phrases.filter(
    (p) =>
      (category === "All phrases" ||
        p.category === category ||
        (category === "Saved" && state.bookmarks.includes(p.id))) &&
      `${p.text} ${p.usage} ${p.tone}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const copy = async (p) => {
    try {
      await navigator.clipboard.writeText(p.text);
      notify("Phrase copied");
    } catch {
      notify("Copy is unavailable here. Select the phrase text to copy it.");
    }
  };
  return (
    <>
      <PageHeading
        eyebrow="WORDS FOR THE MOMENT"
        title="Find your next line."
        description="Thoughtful transitions, persuasive rhythms, and phrases that keep a conversation moving."
      />
      <div className="filter-bar">
        <label className="search-field">
          <Search size={18} />
          <input
            aria-label="Search phrases"
            placeholder="Search a phrase, situation, or tone…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <span className="muted text-sm">
          {state.bookmarks.length} saved phrases
        </span>
      </div>
      <div className="chip-row">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`chip ${category === c ? "active" : ""}`}
            aria-pressed={category === c}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="phrase-grid">
        {found.map((p) => (
          <article className="card phrase-card" key={p.id}>
            <div className="flex justify-between items-center">
              <Badge color="neutral">{p.category}</Badge>
              <button
                className={`icon-btn ${state.bookmarks.includes(p.id) ? "bookmarked" : ""}`}
                aria-label={`${state.bookmarks.includes(p.id) ? "Unsave" : "Save"} phrase: ${p.text}`}
                aria-pressed={state.bookmarks.includes(p.id)}
                onClick={() => toggleBookmark(p.id)}
              >
                <Bookmark
                  size={18}
                  fill={
                    state.bookmarks.includes(p.id) ? "currentColor" : "none"
                  }
                />
              </button>
            </div>
            <Quote size={20} className="quote-mark" />
            <h2>{p.text}</h2>
            <p>{p.usage}</p>
            <div className="phrase-foot">
              <span>
                TONE <b>{p.tone}</b>
              </span>
              <button className="text-link" onClick={() => copy(p)}>
                <Copy size={14} /> Copy
              </button>
            </div>
          </article>
        ))}
      </div>
      {!found.length && (
        <Empty title="Room for your next phrase">
          Try another search, or save a phrase to see it here.
        </Empty>
      )}
    </>
  );
}
