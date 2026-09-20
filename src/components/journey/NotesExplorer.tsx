"use client";

import { useState } from "react";
import { NOTE_FAMILIES, NOTES_CAVEAT } from "@/lib/scent-journey";

/**
 * The three note families in chapter 01, plus the note-versus-ingredient
 * caveat the brief requires.
 *
 * Every family's description is rendered up front rather than revealed on
 * hover: the brief forbids essential information behind hover, and these
 * lines are the substance of the chapter. Selecting a family only emphasises
 * it, so a keyboard or touch visitor loses nothing by not selecting one.
 */
export default function NotesExplorer({
  signatures,
}: {
  signatures: { name: string; notes: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="notes-explorer">
      <ul className="note-families">
        {NOTE_FAMILIES.map((family) => (
          <li key={family.id}>
            <button
              type="button"
              data-state={selected === family.id ? "selected" : undefined}
              aria-pressed={selected === family.id}
              onClick={() =>
                setSelected((current) =>
                  current === family.id ? null : family.id,
                )
              }
            >
              <strong>{family.name}</strong>
              <span>{family.line}</span>
            </button>
          </li>
        ))}
      </ul>

      <div className="notes-caveat">
        <button
          type="button"
          aria-expanded={open}
          aria-controls="notes-caveat-body"
          onClick={() => setOpen((value) => !value)}
        >
          What is a note, exactly?
        </button>
        {open && <p id="notes-caveat-body">{NOTES_CAVEAT}</p>}
      </div>

      <ul className="note-signatures">
        {signatures.map((signature) => (
          <li key={signature.name}>
            <strong>{signature.name}</strong>
            <span>{signature.notes}</span>
          </li>
        ))}
      </ul>
      <p className="notes-footnote">
        Scent notes, not manufacturing ingredients.
      </p>
    </div>
  );
}
