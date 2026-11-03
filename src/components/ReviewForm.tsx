"use client";

import { startTransition, useActionState, useState, type FormEvent } from "react";
import StarRatingInput from "./StarRatingInput";
import { submitReview } from "@/lib/actions/review";
import type { ReviewFormState } from "@/types/review";

const initialState: ReviewFormState = { status: "idle", message: "", fieldErrors: {} };
const COMMENT_MAX = 500;

const labelClass = "text-sm font-semibold text-ink md:text-base";
// text-base (16 px) di HP mencegah zoom otomatis iOS saat fokus.
const inputClass =
  "w-full rounded-xl border border-line bg-paper px-4 py-3 text-base text-ink placeholder:text-muted outline-none transition-colors focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/40 aria-invalid:border-brand-strong";
const errorClass = "text-sm text-brand-strong";

export default function ReviewForm() {
  const [state, formAction, pending] = useActionState(submitReview, initialState);
  // Kolom dikendalikan state, jadi nilai tetap ada saat kiriman gagal.
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  // Reset kolom sekali setiap ada hasil sukses baru (pola "sesuaikan state saat input berubah").
  const [handled, setHandled] = useState(state);
  if (state !== handled) {
    setHandled(state);
    if (state.status === "success") {
      setName("");
      setRating(0);
      setComment("");
    }
  }

  // Kirim manual agar React tidak mengosongkan form otomatis (nilai dipertahankan bila gagal).
  // Atribut action tetap ada sebagai cadangan tanpa JavaScript.
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(() => formAction(data));
  }

  const errors = state.fieldErrors;
  const commentLength = [...comment].length;

  return (
    <form
      action={formAction}
      onSubmit={onSubmit}
      noValidate
      className="mx-auto flex w-full max-w-4xl flex-col gap-6 rounded-card border border-line bg-card p-4 md:p-8"
    >
      <div className="flex flex-col gap-2">
        <label htmlFor="review-name" className={labelClass}>
          Nama
        </label>
        <input
          id="review-name"
          name="author_name"
          type="text"
          autoComplete="name"
          required
          maxLength={40}
          placeholder="Masukkan nama Anda"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={errors.author_name ? true : undefined}
          aria-describedby={errors.author_name ? "review-name-error" : undefined}
          className={inputClass}
        />
        {errors.author_name && (
          <p id="review-name-error" role="alert" className={errorClass}>
            {errors.author_name}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <span id="review-rating-label" className={labelClass}>
          Rating
        </span>
        <StarRatingInput
          name="rating"
          value={rating}
          onChange={setRating}
          labelId="review-rating-label"
          invalid={!!errors.rating}
          describedBy={errors.rating ? "review-rating-error" : undefined}
        />
        {errors.rating && (
          <p id="review-rating-error" role="alert" className={errorClass}>
            {errors.rating}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="review-comment" className={labelClass}>
          Ulasan Anda
        </label>
        <textarea
          id="review-comment"
          name="comment"
          rows={5}
          required
          maxLength={COMMENT_MAX}
          placeholder="Ceritakanlah pengalaman bersantap Anda..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          aria-invalid={errors.comment ? true : undefined}
          aria-describedby={`review-comment-count${errors.comment ? " review-comment-error" : ""}`}
          className={`${inputClass} resize-y`}
        />
        <div className="flex items-start justify-between gap-4">
          {errors.comment ? (
            <p id="review-comment-error" role="alert" className={errorClass}>
              {errors.comment}
            </p>
          ) : (
            <span />
          )}
          <p id="review-comment-count" className="shrink-0 text-sm text-muted tabular-nums">
            {commentLength}/{COMMENT_MAX} karakter
          </p>
        </div>
      </div>

      {/* Kolom jebakan untuk bot: tidak terlihat, tidak bisa difokus, diabaikan pembaca layar */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="review-website">Situs web</label>
        <input id="review-website" name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      <div className="flex flex-col-reverse items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p
          aria-live="polite"
          className={`text-sm md:text-base ${state.status === "success" ? "font-semibold text-ink" : "text-brand-strong"}`}
        >
          {state.message}
        </p>
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 self-end rounded-full bg-brand px-8 py-3 text-base font-semibold text-paper transition-colors hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:bg-muted"
        >
          {pending ? "Mengirim..." : "Kirim"}
        </button>
      </div>
    </form>
  );
}
