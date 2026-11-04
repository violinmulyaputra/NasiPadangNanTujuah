import { Avatar, AvatarFallback } from "./Avatar";
import HoverGlow from "./HoverGlow";
import Reveal from "./Reveal";
import { StarRow } from "./StarIcon";
import { formatDate, formatRating } from "@/lib/format";
import { getLatestReviews } from "@/lib/reviews";

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => [...part][0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export default async function ReviewList() {
  const reviews = await getLatestReviews(10);

  if (reviews.length === 0) {
    return (
      <Reveal index={1}>
        <p className="text-center text-base text-muted md:text-lg">Belum ada ulasan. Jadilah yang pertama!</p>
      </Reveal>
    );
  }

  return (
    <ul className="isolate mx-auto flex w-full max-w-4xl flex-col gap-6">
      {reviews.map((review, i) => (
        <li key={review.id}>
          <Reveal index={Math.min(i + 1, 3)}>
            <article className="group relative">
              <HoverGlow className="-z-10" />
              <div className="rounded-card border border-line bg-card p-4 hover-lift md:p-6">
                <div className="flex items-center gap-3">
                  <Avatar className="size-12">
                    <AvatarFallback className="bg-paper text-sm font-semibold">
                      {initials(review.author_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-col gap-1">
                    <h3 className="text-base leading-tight font-semibold break-words text-ink">
                      {review.author_name}
                    </h3>
                    <time dateTime={review.created_at} className="text-sm text-muted">
                      {formatDate(review.created_at)}
                    </time>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <StarRow value={review.rating} starClassName="size-5" />
                  <span className="sr-only">Rating {formatRating(review.rating)} dari 5</span>
                </div>
                <p className="mt-3 text-sm leading-relaxed whitespace-pre-line break-words text-ink md:text-base">
                  {review.comment}
                </p>
              </div>
            </article>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}
