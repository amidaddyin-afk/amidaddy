"use client";

import Link from "next/link";
import { useCallback, useSyncExternalStore } from "react";
import { Check } from "lucide-react";

/**
 * Course progress across the eight chapters.
 *
 * The chapters were eight unrelated articles: nothing marked where you were,
 * what you had finished, or how much was left, so there was no reason to come
 * back for the next one. This tracks completion in localStorage and shows it
 * as a row of eight steps at the top of every chapter.
 *
 * localStorage rather than an account: the course is deliberately free with no
 * sign-up, and progress is a private convenience, not data worth an account.
 * Every read and write is guarded - Safari private mode throws on access - and
 * the component renders the same markup with zero progress if storage is
 * unavailable, so nothing depends on it.
 */

const KEY = "amidaddy.scent-school.completed";

/**
 * localStorage read as an external store.
 *
 * `useSyncExternalStore` is the right shape here: the server has no storage,
 * so the server snapshot is empty and the client snapshot is the stored list,
 * with no setState in an effect and no hydration mismatch. The snapshot is
 * memoised on the raw string because getSnapshot must return a stable
 * reference for an unchanged store, or React re-renders forever.
 */
let cachedRaw: string | null = null;
let cachedValue: string[] = [];

function getSnapshot(): string[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    return EMPTY;
  }
  if (raw === cachedRaw) return cachedValue;
  cachedRaw = raw;
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    cachedValue = Array.isArray(parsed)
      ? parsed.filter((v): v is string => typeof v === "string")
      : [];
  } catch {
    cachedValue = [];
  }
  return cachedValue;
}

const EMPTY: string[] = [];
const getServerSnapshot = () => EMPTY;

/** Notifies subscribers after a local write, and on changes from other tabs. */
const listeners = new Set<() => void>();
function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}
function emit() {
  listeners.forEach((l) => l());
}

export default function ChapterProgress({
  chapters,
  current,
}: {
  chapters: { slug: string; number: string; title: string }[];
  current: string;
}) {
  const completed = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  const isDone = useCallback(
    (slug: string) => completed.includes(slug),
    [completed],
  );

  const toggle = useCallback(() => {
    const prev = getSnapshot();
    const next = prev.includes(current)
      ? prev.filter((s) => s !== current)
      : [...prev, current];
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // Storage unavailable (private mode). Nothing to persist; the UI simply
      // stays as it is rather than showing a change that will not survive.
      return;
    }
    emit();
  }, [current]);

  const doneCount = completed.filter((s) =>
    chapters.some((c) => c.slug === s),
  ).length;
  const currentDone = isDone(current);

  return (
    <div className="chapter-progress">
      <ol className="chapter-progress-steps">
        {chapters.map((c) => {
          const done = hydrated && isDone(c.slug);
          const active = c.slug === current;
          return (
            <li key={c.slug}>
              <Link
                href={`/scent-school/${c.slug}`}
                data-state={active ? "current" : done ? "done" : "todo"}
                aria-current={active ? "page" : undefined}
                aria-label={`Chapter ${c.number}: ${c.title}${done ? ", finished" : ""}`}
              >
                <span aria-hidden="true">
                  {done && !active ? (
                    <Check size={11} strokeWidth={3} />
                  ) : (
                    c.number
                  )}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>

      <div className="chapter-progress-meta">
        {/* Rendered only after hydration: the count comes from localStorage,
            which the server cannot know, and a mismatch would flash. */}
        <p>{hydrated ? `${doneCount} of ${chapters.length} finished` : " "}</p>
        <button type="button" onClick={toggle} data-done={currentDone}>
          <Check size={13} strokeWidth={2.5} aria-hidden="true" />
          {currentDone ? "Finished" : "Mark as read"}
        </button>
      </div>
    </div>
  );
}
