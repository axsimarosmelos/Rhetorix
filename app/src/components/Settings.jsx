import { useRef, useState } from "react";
import { Download, Upload, Save, RotateCcw } from "lucide-react";
import {
  useApp,
  validateProgress as validateState,
} from "../context/AppContext";
import { newState, dateKey } from "../lib/engine";
import { Button, Modal } from "./UI";
export default function Settings({ onClose }) {
  const { state, setState, importState, notify } = useApp();
  const [draft, setDraft] = useState({
    name: state.name,
    dailyGoal: state.dailyGoal,
    targetDate: state.targetDate,
    api: { ...state.api },
  });
  const [error, setError] = useState("");
  const [incoming, setIncoming] = useState(null);
  const [reset, setReset] = useState(false);
  const [resetText, setResetText] = useState("");
  const input = useRef();
  const exportData = () => {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(state, null, 2)], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `rhetorix-backup-${dateKey()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify("Backup downloaded");
  };
  const readFile = async (e) => {
    setError("");
    const file = e.target.files[0];
    if (!file) return;
    try {
      if (file.size > 5000000)
        throw new Error(
          "Backup is too large. Choose a Rhetorix JSON backup under 5 MB.",
        );
      setIncoming(validateState(JSON.parse(await file.text())));
    } catch (err) {
      setError(
        err instanceof SyntaxError
          ? "That file is not valid JSON. Your progress has not changed."
          : err.message,
      );
    } finally {
      e.target.value = "";
    }
  };
  const save = (e) => {
    e.preventDefault();
    setError("");
    try {
      const next = validateState({
        ...state,
        ...draft,
        name: draft.name.trim() || "Speaker",
      });
      setState(next);
      notify("Settings saved");
      onClose();
    } catch {
      setError(
        "Check your target date, daily goal, and API path. The target must be after your start date; use a same-origin API path such as /api/debate.",
      );
    }
  };
  return (
    <Modal title="Make the practice yours." onClose={onClose}>
      <form onSubmit={save}>
        <div className="form-two-col">
          <label className="field">
            Your name
            <input
              value={draft.name}
              maxLength={40}
              onChange={(e) =>
                setDraft((d) => ({ ...d, name: e.target.value }))
              }
            />
          </label>
          <label className="field">
            Daily goal (minutes)
            <input
              type="number"
              min={5}
              max={180}
              required
              value={draft.dailyGoal}
              onChange={(e) =>
                setDraft((d) => ({ ...d, dailyGoal: Number(e.target.value) }))
              }
            />
          </label>
        </div>
        <label className="field">
          Your target date
          <input
            type="date"
            required
            value={draft.targetDate}
            onChange={(e) =>
              setDraft((d) => ({ ...d, targetDate: e.target.value }))
            }
          />
          <span className="field-hint">
            Journey started {state.startDate}. The default target is four
            calendar months later; the curriculum has 16 weeks.
          </span>
        </label>
        <div className="divider" />
        <h3>Debate opponent</h3>
        <label className="field">
          Response engine
          <select
            value={draft.api.mode}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                api: { ...d.api, mode: e.target.value },
              }))
            }
          >
            <option value="mock">Local mock engine · no account needed</option>
            <option value="api">Connected LLM · your backend endpoint</option>
          </select>
        </label>
        {draft.api.mode === "api" && (
          <>
            <label className="field">
              Same-origin endpoint
              <input
                value={draft.api.endpoint}
                placeholder="/api/debate"
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    api: { ...d.api, endpoint: e.target.value },
                  }))
                }
              />
            </label>
            <p className="source-note">
              Your backend receives the debate prompt and messages, then returns{" "}
              {'{ "reply": "…" }'}. Provider keys belong on the server. The
              included README documents this contract and a server example.
            </p>
          </>
        )}
        {error && (
          <p className="notice warning" role="alert">
            {error}
          </p>
        )}
        <Button type="submit">
          <Save size={16} /> Save settings
        </Button>
      </form>
      <div className="divider" />
      <h3>Your progress, in your hands.</h3>
      <p className="muted text-sm">
        Progress is saved in this browser. Export a backup to move devices or
        keep a copy before clearing browser data.
      </p>
      <div className="flex flex-wrap gap-3 mt-4">
        <Button variant="secondary" onClick={exportData}>
          <Download size={16} /> Export backup
        </Button>
        <Button variant="secondary" onClick={() => input.current.click()}>
          <Upload size={16} /> Import backup
        </Button>
        <input
          ref={input}
          type="file"
          accept="application/json,.json"
          className="hidden"
          aria-label="Import progress file"
          onChange={readFile}
        />
      </div>
      {incoming && (
        <div className="notice warning import-confirm">
          <div>
            <strong>Replace this browser’s progress?</strong>
            <p>
              This backup contains {incoming.learned.length} learned words and{" "}
              {incoming.completed.length} completed weeks.
            </p>
          </div>
          <Button
            onClick={() => {
              importState(incoming);
              onClose();
            }}
          >
            Replace progress
          </Button>
          <button className="text-link" onClick={() => setIncoming(null)}>
            Cancel
          </button>
        </div>
      )}
      <div className="divider" />
      {reset ? (
        <div className="reset-confirm">
          <label className="field">
            Type RESET to start a new journey
            <input
              value={resetText}
              onChange={(e) => setResetText(e.target.value)}
              placeholder="RESET"
            />
          </label>
          <div className="flex gap-3">
            <Button
              variant="danger"
              disabled={resetText !== "RESET"}
              onClick={() => {
                importState(newState());
                onClose();
              }}
            >
              Reset all progress
            </Button>
            <Button variant="secondary" onClick={() => setReset(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <button
          className="text-link danger-text"
          onClick={() => setReset(true)}
        >
          <RotateCcw size={14} /> Start a new journey
        </button>
      )}
    </Modal>
  );
}
