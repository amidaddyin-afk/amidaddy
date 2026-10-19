import "server-only";

import type { PoolClient } from "pg";
import { db } from "@/lib/db";

export type PublicReview = {
  id: string;
  authorName: string;
  rating: number;
  title: string | null;
  body: string;
  verifiedPurchase: boolean;
  featured: boolean;
  createdAt: string;
};

export type ReviewSummary = {
  reviews: PublicReview[];
  count: number;
  average: number;
};

export type AdminReview = PublicReview & {
  status: "PUBLISHED" | "HIDDEN";
  productName: string;
  productSlug: string;
  customerEmail: string | null;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function mapReview(row: Record<string, unknown>): PublicReview {
  return {
    id: String(row.id),
    authorName: String(row.author_name),
    rating: Number(row.rating),
    title: row.title ? String(row.title) : null,
    body: String(row.body),
    verifiedPurchase: row.verified_purchase === true,
    featured: row.featured === true,
    createdAt: new Date(String(row.created_at)).toISOString(),
  };
}

const EMPTY: ReviewSummary = { reviews: [], count: 0, average: 0 };

/** Published reviews for the product page, featured first. Fails soft: a
 * product page must still render if the reviews table is missing (migration
 * not yet run) or the database is unreachable during a build. */
export async function getProductReviews(
  productId: string,
): Promise<ReviewSummary> {
  if (!UUID.test(productId) || !process.env.DATABASE_URL) return EMPTY;
  try {
    const [list, stats] = await Promise.all([
      db().query(
        "select id,author_name,rating,title,body,verified_purchase,featured,created_at from public.product_reviews where product_id=$1 and status='PUBLISHED' order by featured desc,created_at desc limit 50",
        [productId],
      ),
      db().query(
        "select count(*)::int count,coalesce(avg(rating),0)::float average from public.product_reviews where product_id=$1 and status='PUBLISHED'",
        [productId],
      ),
    ]);
    return {
      reviews: list.rows.map(mapReview),
      count: Number(stats.rows[0]?.count ?? 0),
      average: Number(stats.rows[0]?.average ?? 0),
    };
  } catch {
    return EMPTY;
  }
}

export async function findReviewableProduct(productId: string) {
  const { rows } = await db().query(
    "select id,slug from public.products where id=$1 and active and deleted_at is null",
    [productId],
  );
  return rows[0]
    ? { id: String(rows[0].id), slug: String(rows[0].slug) }
    : null;
}

/** A paid, uncancelled order containing any variant of this product. */
export async function hasPurchasedProduct(
  customerId: string,
  productId: string,
) {
  const { rows } = await db().query(
    "select exists(select 1 from public.orders o join public.order_items oi on oi.order_id=o.id join public.product_variants v on v.id=oi.variant_id where o.customer_id=$1 and v.product_id=$2 and o.payment_status in('PAID','PARTIALLY_REFUNDED') and o.status not in('CANCELLED','EXPIRED')) purchased",
    [customerId, productId],
  );
  return rows[0]?.purchased === true;
}

/** One review per customer per product; posting again edits it. An edit drops
 * the featured flag so an admin re-approves what is highlighted, and leaves
 * status alone so editing cannot bring back a hidden review. */
export async function saveReview(input: {
  productId: string;
  customerId: string;
  authorName: string;
  rating: number;
  title: string | null;
  body: string;
  verifiedPurchase: boolean;
}) {
  await db().query(
    "insert into public.product_reviews(product_id,customer_id,author_name,rating,title,body,verified_purchase) values($1,$2,$3,$4,$5,$6,$7) on conflict(product_id,customer_id) do update set author_name=excluded.author_name,rating=excluded.rating,title=excluded.title,body=excluded.body,verified_purchase=excluded.verified_purchase,featured=false,updated_at=now()",
    [
      input.productId,
      input.customerId,
      input.authorName,
      input.rating,
      input.title,
      input.body,
      input.verifiedPurchase,
    ],
  );
}

export type ReviewModeration = "hide" | "publish" | "feature" | "unfeature";

/** Hide takes spam off the storefront and drops any highlight with it;
 *  feature only applies to a published review. */
const MODERATION_SQL: Record<ReviewModeration, string> = {
  hide: "update public.product_reviews set status='HIDDEN',featured=false,updated_at=now() where id=$1",
  publish:
    "update public.product_reviews set status='PUBLISHED',updated_at=now() where id=$1",
  feature:
    "update public.product_reviews set featured=true,updated_at=now() where id=$1 and status='PUBLISHED'",
  unfeature:
    "update public.product_reviews set featured=false,updated_at=now() where id=$1",
};

export async function moderateReview(
  client: PoolClient,
  id: string,
  op: ReviewModeration,
) {
  await client.query(MODERATION_SQL[op], [id]);
}

export async function listAdminReviews(): Promise<AdminReview[]> {
  const { rows } = await db().query(
    "select r.*,p.name product_name,p.slug product_slug,pr.email customer_email from public.product_reviews r join public.products p on p.id=r.product_id left join public.profiles pr on pr.id=r.customer_id order by r.created_at desc limit 200",
  );
  return rows.map((row) => ({
    ...mapReview(row),
    status: row.status === "HIDDEN" ? "HIDDEN" : "PUBLISHED",
    productName: String(row.product_name),
    productSlug: String(row.product_slug),
    customerEmail: row.customer_email ? String(row.customer_email) : null,
  }));
}
