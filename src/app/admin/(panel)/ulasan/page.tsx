import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import AdminReviewActions from "@/components/AdminReviewActions";
import { StarRow } from "@/components/StarIcon";
import { listReviews, parseReviewListParams, REVIEWS_PER_PAGE, type ReviewListParams } from "@/lib/admin-reviews";
import { formatDateTime, formatRating } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AdminReviewFilter } from "@/types/review";

export const metadata: Metadata = { title: "Ulasan" };

const FILTERS: { value: AdminReviewFilter; label: string }[] = [
  { value: "semua", label: "Semua" },
  { value: "tampil", label: "Tampil" },
  { value: "tersembunyi", label: "Disembunyikan" },
  { value: "baru", label: "7 hari terakhir" },
];

const focusRing =
  "focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-paper focus-visible:outline-none";
const pagerLink = cn(
  "inline-flex min-h-10 items-center rounded-full border border-ink px-4 text-sm font-semibold transition-colors duration-150 hover:border-brand-strong hover:text-brand-strong",
  focusRing,
);

function listHref({ filter, page }: Partial<ReviewListParams>) {
  const search = new URLSearchParams();
  if (filter && filter !== "semua") search.set("filter", filter);
  if (page && page > 1) search.set("halaman", String(page));
  const qs = search.toString();
  return qs ? `/admin/ulasan?${qs}` : "/admin/ulasan";
}

async function ReviewModeration({ searchParams }: { searchParams: PageProps<"/admin/ulasan">["searchParams"] }) {
  const params = parseReviewListParams(await searchParams);
  // listReviews memanggil requireAdmin() sebelum menyentuh data.
  const { reviews, total } = await listReviews(params);
  const pages = Math.max(1, Math.ceil(total / REVIEWS_PER_PAGE));

  return (
    <>
      <nav aria-label="Filter ulasan" className="mt-4">
        <ul className="flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const active = f.value === params.filter;
            return (
              <li key={f.value}>
                <Link
                  href={listHref({ filter: f.value })}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex min-h-10 items-center rounded-full px-4 text-sm font-semibold transition-colors duration-150",
                    focusRing,
                    active ? "bg-brand-strong text-paper" : "bg-card text-ink hover:text-brand-strong",
                  )}
                >
                  {f.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <p className="mt-4 text-sm text-muted">{total} ulasan.</p>

      {reviews.length === 0 ? (
        <p className="mt-3 rounded-card border border-line bg-card p-6 text-center text-muted">Tidak ada ulasan.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {reviews.map((review) => (
            <li
              key={review.id}
              className={cn(
                "rounded-card border p-4 md:grid md:grid-cols-[minmax(0,1fr)_16rem] md:gap-6",
                review.is_visible ? "border-line bg-card" : "border-dashed border-muted bg-paper",
              )}
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="font-semibold break-words">{review.author_name}</span>
                  <StarRow value={review.rating} starClassName="size-4" />
                  <span className="sr-only">Rating {formatRating(review.rating)} dari 5</span>
                  {!review.is_visible && (
                    <span className="rounded-full bg-ink px-2 py-0.5 text-xs font-semibold text-paper">Disembunyikan</span>
                  )}
                </div>
                <p className="mt-2 break-words whitespace-pre-line">{review.comment}</p>
                <p className="mt-2 text-sm text-muted">{formatDateTime(review.created_at)}</p>
              </div>
              <div className="mt-3 md:mt-0">
                <AdminReviewActions id={review.id} name={review.author_name} visible={review.is_visible} />
              </div>
            </li>
          ))}
        </ul>
      )}

      {pages > 1 && (
        <nav aria-label="Halaman daftar ulasan" className="mt-4 flex items-center justify-between gap-3">
          {params.page > 1 ? (
            <Link href={listHref({ ...params, page: Math.min(params.page - 1, pages) })} className={pagerLink}>
              Sebelumnya
            </Link>
          ) : (
            <span />
          )}
          <span className="text-sm text-muted">
            Halaman {params.page} dari {pages}
          </span>
          {params.page < pages ? (
            <Link href={listHref({ ...params, page: params.page + 1 })} className={pagerLink}>
              Berikutnya
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </>
  );
}

// F5: moderasi ulasan. Semua ulasan termasuk yang disembunyikan, terbaru di atas, 20 per halaman.
export default function AdminReviewsPage({ searchParams }: PageProps<"/admin/ulasan">) {
  return (
    <main>
      <h1 className="font-display text-2xl font-semibold md:text-3xl">Ulasan</h1>
      <Suspense
        fallback={
          <div
            aria-busy="true"
            aria-label="Memuat ulasan"
            className="mt-4 h-96 animate-pulse rounded-card bg-line/60 motion-reduce:animate-none"
          />
        }
      >
        <ReviewModeration searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
