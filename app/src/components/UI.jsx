import { useEffect, useRef } from "react";
import { ArrowUpRight, ArrowRight, X, Check, BookOpen } from "lucide-react";
export const Button = ({
  children,
  variant = "primary",
  className = "",
  ...props
}) => (
  <button className={`btn btn-${variant} ${className}`} {...props}>
    {children}
  </button>
);
export const Badge = ({ children, color = "sage" }) => (
  <span className={`badge ${color}`}>{children}</span>
);
export function PageHeading({ eyebrow, title, description, action }) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}
export function SectionHeading({ title, action, onClick }) {
  return (
    <div className="section-heading">
      <h2>{title}</h2>
      {action && (
        <button className="text-link" onClick={onClick}>
          {action}
          <ArrowUpRight size={16} />
        </button>
      )}
    </div>
  );
}
export function Empty({ title, children }) {
  return (
    <div className="empty">
      <BookOpen size={30} />
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}
export function Tabs({ items, value, onChange, label = "Section" }) {
  const tablist = useRef();
  const moveFocus = (event) => {
    const current = items.indexOf(value);
    const next =
      event.key === "ArrowRight"
        ? (current + 1) % items.length
        : event.key === "ArrowLeft"
          ? (current - 1 + items.length) % items.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? items.length - 1
              : null;
    if (next === null) return;
    event.preventDefault();
    onChange(items[next]);
    tablist.current.querySelectorAll("button")[next].focus();
  };
  return (
    <div
      className="tabs"
      role="tablist"
      aria-label={label}
      ref={tablist}
      onKeyDown={moveFocus}
    >
      {items.map((item) => (
        <button
          key={item}
          role="tab"
          aria-selected={value === item}
          tabIndex={value === item ? 0 : -1}
          onClick={() => onChange(item)}
          className={value === item ? "active" : ""}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
export function Modal({ title, onClose, children }) {
  const ref = useRef();
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const before = document.activeElement;
    const node = ref.current;
    node.showModal();
    const handle = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close.current();
      }
    };
    node.addEventListener("keydown", handle);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      node.removeEventListener("keydown", handle);
      node.close();
      document.body.style.overflow = overflow;
      before?.focus();
    };
  }, []);
  return (
    <dialog
      className="modal"
      ref={ref}
      aria-labelledby="modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-inner">
        <div className="section-heading">
          <h2 id="modal-title">{title}</h2>
          <button
            className="icon-btn"
            aria-label="Close dialog"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
export const ProgressBar = ({ value, label }) => (
  <div
    className="progress-track"
    role="progressbar"
    aria-valuenow={Math.max(0, Math.min(100, Math.round(value)))}
    aria-valuemin={0}
    aria-valuemax={100}
    aria-label={label}
  >
    <span style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
  </div>
);
export const CheckItem = ({ children }) => (
  <div className="check-item">
    <Check size={16} />
    <span>{children}</span>
  </div>
);
export const NextArrow = () => <ArrowRight size={17} />;
