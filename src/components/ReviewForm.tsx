"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import {
  startTransition,
  useActionState,
  useEffect,
  useState,
  type FormEvent,
} from "react";
import { createClient } from "@/lib/supabase/client";
import {
  submitReviewAction,
  type ReviewActionState,
} from "@/features/reviews/actions";

const initial: ReviewActionState = {};
const LABELS = ["Poor", "Fair", "Good", "Very good", "Exceptional"];

export default function ReviewForm({
  productId,
  slug,
}: {
  productId: string;
  slug: string;
}) {
  // The product page is a cached render shared by every visitor, so whether
  // this visitor is signed in is read here in the browser. The server action
  // re-checks the session; this only decides which prompt to show.
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [state, formAction, pending] = useActionState(
    async (previous: ReviewActionState, formData: FormData) => {
      const result = await submitReviewAction(previous, formData);
      if (result.message) {
        setOpen(false);
        setRating(0);
      }
      return result;
    },
    initial,
  );

  useEffect(() => {
    // createClient throws when Supabase env vars are missing; inside the
    // promise chain that lands in .catch like any other failure.
    Promise.resolve()
      .then(() => createClient().auth.getSession())
      .then(({ data }) => setSignedIn(Boolean(data.session)))
      .catch(() => setSignedIn(false));
  }, []);

  // Submitting through onSubmit keeps the text on a validation error: React
  // resets a form after its action runs, which would wipe the review.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  if (signedIn === null) return <div className="pdp-review-cta" />;

  if (!signedIn)
    return (
      <div className="pdp-review-cta">
        <p>Worn it? Share how it wears on you.</p>
        <Link
          href={`/login?next=${encodeURIComponent(`/products/${slug}`)}`}
          className="btn-ghost"
        >
          Sign in to write a review
        </Link>
      </div>
    );

  if (!open)
    return (
      <div className="pdp-review-cta">
        {state.message ? (
          <p role="status">{state.message}</p>
        ) : (
          <p>Worn it? Share how it wears on you.</p>
        )}
        <button
          type="button"
          className="btn-ghost"
          onClick={() => setOpen(true)}
        >
          Write a review
        </button>
      </div>
    );

  const shown = hover || rating;
  return (
    <form
      action={formAction}
      onSubmit={handleSubmit}
      className="pdp-review-form"
    >
      <input type="hidden" name="productId" value={productId} />
      <fieldset>
        <legend>Your rating</legend>
        <div className="pdp-review-rate" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((value) => (
            <label key={value} onMouseEnter={() => setHover(value)}>
              <input
                type="radio"
                name="rating"
                value={value}
                checked={rating === value}
                onChange={() => setRating(value)}
                required
              />
              <Star
                size={24}
                aria-hidden="true"
                data-filled={value <= shown || undefined}
              />
              <span className="sr-only">
                {value} star{value === 1 ? "" : "s"}, {LABELS[value - 1]}
              </span>
            </label>
          ))}
          <span className="pdp-review-rate-label" aria-hidden="true">
            {shown ? LABELS[shown - 1] : ""}
          </span>
        </div>
      </fieldset>
      <input
        name="title"
        maxLength={100}
        placeholder="Headline (optional)"
        className="pdp-review-input"
      />
      <textarea
        name="body"
        required
        minLength={10}
        maxLength={2000}
        rows={5}
        placeholder="How does it open, how long does it last, where do you wear it?"
        className="pdp-review-input"
      />
      {state.error && (
        <p className="pdp-review-error" role="alert">
          {state.error}
        </p>
      )}
      <div className="pdp-review-actions">
        <button disabled={pending} className="lux-button">
          {pending ? "Posting…" : "Post review"}
        </button>
        <button
          type="button"
          className="btn-ghost"
          onClick={() => setOpen(false)}
        >
          Cancel
        </button>
      </div>
      <p className="pdp-review-note">
        Your first name and last initial are shown with your review.
      </p>
    </form>
  );
}
