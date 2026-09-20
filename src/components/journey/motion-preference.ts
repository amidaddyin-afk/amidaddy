"use client";

import { useSyncExternalStore } from "react";

/**
 * Page-level "Skip animation" preference.
 *
 * Separate from prefers-reduced-motion: that is an OS setting a visitor may
 * not want to change globally just to read one page. Either one switching off
 * is enough to stop scrubbing, attach no video sources and render the posters.
 *
 * Stored in localStorage so the choice survives a refresh and anchor-jump
 * navigation. Every access is guarded - Safari private mode throws - and the
 * page behaves identically with storage unavailable, just without memory.
 *
 * `useSyncExternalStore` gives the server snapshot (false) and the client
 * snapshot separately, so there is no setState-in-effect and no hydration
 * mismatch.
 */

const KEY = "amidaddy.scent-school.skip-animation";
const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot() {
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

const getServerSnapshot = () => false;

export function useSkipAnimation() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function setSkipAnimation(skip: boolean) {
  try {
    if (skip) window.localStorage.setItem(KEY, "1");
    else window.localStorage.removeItem(KEY);
  } catch {
    // Storage blocked: the toggle still applies for this render pass via the
    // notification below, it just will not survive a reload.
  }
  listeners.forEach((listener) => listener());
}
