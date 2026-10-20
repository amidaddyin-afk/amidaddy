"use client";

import { useEffect, useState, type ComponentProps } from "react";
import { useFormStatus } from "react-dom";

/**
 * Submit button for admin forms. While the form's server action runs it is
 * disabled and marked aria-busy, which the stylesheet turns into a spinner,
 * so nobody wonders whether the click registered.
 */
export function SubmitButton({ disabled, ...props }: ComponentProps<"button">) {
  const { pending } = useFormStatus();
  return (
    <button
      {...props}
      disabled={pending || disabled}
      aria-busy={pending || undefined}
    />
  );
}

const EVENT = "admin-toast";
type Tone = "ok" | "error";

/** Pop-up confirmation from anywhere in the admin portal. */
export function toast(message: string, tone: Tone = "ok") {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { message, tone } }));
}

/** Mount once; shows each toast for a few seconds, newest last. */
export function Toaster() {
  const [items, setItems] = useState<
    Array<{ id: number; message: string; tone: Tone }>
  >([]);
  useEffect(() => {
    let next = 0;
    const show = (event: Event) => {
      const { message, tone } = (event as CustomEvent).detail;
      const id = ++next;
      setItems((current) => [...current, { id, message, tone }]);
      setTimeout(
        () => setItems((current) => current.filter((item) => item.id !== id)),
        tone === "error" ? 7000 : 4000,
      );
    };
    window.addEventListener(EVENT, show);
    return () => window.removeEventListener(EVENT, show);
  }, []);
  return (
    <div className="admin-toasts" role="status" aria-live="polite">
      {items.map((item) => (
        <p key={item.id} className={`admin-toast admin-toast-${item.tone}`}>
          {item.message}
        </p>
      ))}
    </div>
  );
}

/** Blurs the page behind a spinner and status line while work is running. */
export function BusyOverlay({ message }: { message: string }) {
  return (
    <div className="admin-busy" role="alert" aria-live="assertive">
      <p>
        <span className="admin-busy-spinner" aria-hidden="true" />
        {message}
      </p>
    </div>
  );
}
