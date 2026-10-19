import { BadgeCheck, Star } from "lucide-react";
import ReviewForm from "@/components/ReviewForm";
import type { ReviewSummary } from "@/lib/reviews";

export function Stars({
  rating,
  size = 15,
}: {
  rating: number;
  size?: number;
}) {
  return (
    <span className="review-stars" aria-label={`${rating.toFixed(1)} out of 5`}>
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          size={size}
          aria-hidden="true"
          data-filled={value <= Math.round(rating) || undefined}
        />
      ))}
    </span>
  );
}

/** Server-rendered review panel for the product page. Lives inside the cached
 * page render; a new review or a moderation change revalidates the page. */
export default function ProductReviews({
  productId,
  productName,
  slug,
  summary,
}: {
  productId: string;
  productName: string;
  slug: string;
  summary: ReviewSummary;
}) {
  const { reviews, count, average } = summary;
  return (
    <section
      className="pdp-reviews"
      id="reviews"
      aria-labelledby="reviews-title"
    >
      <div className="pdp-reviews-head">
        <div>
          <h2 id="reviews-title" className="display-title">
            In their words.
          </h2>
          <p>
            {count
              ? `What wearers say about ${productName}, in their own words.`
              : "No reviews yet. Yours could be the first."}
          </p>
        </div>
        {count > 0 && (
          <div className="pdp-reviews-score">
            <strong>{average.toFixed(1)}</strong>
            <div>
              <Stars rating={average} size={17} />
              <span className="pdp-reviews-count">
                {count} review{count === 1 ? "" : "s"}
              </span>
            </div>
          </div>
        )}
      </div>

      {reviews.length > 0 && (
        <ul className="pdp-review-list">
          {reviews.map((review) => (
            <li
              key={review.id}
              className="pdp-review"
              data-featured={review.featured || undefined}
            >
              {review.featured && (
                <span className="pdp-review-flag">Highlighted review</span>
              )}
              <Stars rating={review.rating} />
              {review.title && <h3>{review.title}</h3>}
              <p>{review.body}</p>
              <footer>
                <span>{review.authorName}</span>
                {review.verifiedPurchase && (
                  <span className="pdp-review-verified">
                    <BadgeCheck size={13} aria-hidden="true" /> Verified buyer
                  </span>
                )}
                <time dateTime={review.createdAt}>
                  {new Date(review.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </time>
              </footer>
            </li>
          ))}
        </ul>
      )}

      <ReviewForm productId={productId} slug={slug} />
    </section>
  );
}
