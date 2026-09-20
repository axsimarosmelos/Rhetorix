import { useEffect, useState } from "react";
export function useCountdown(deadline, onExpire) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!deadline) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(timer);
  }, [deadline]);
  useEffect(() => {
    if (deadline && now >= deadline) onExpire();
  }, [deadline, now, onExpire]);
  return deadline ? Math.max(0, Math.ceil((deadline - now) / 1000)) : null;
}
export const elapsed = (start) =>
  Math.max(1, Math.round((Date.now() - start) / 1000));
