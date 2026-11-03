"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { uploadPaymentProof } from "@/lib/actions/payment";
import { compressImage } from "@/lib/compress-image";
import { formatDateTime, formatRupiah } from "@/lib/format";
import { BANK_TRANSFER, MAX_PROOF_BYTES, MAX_PROOF_UPLOADS, QRIS_IMAGE } from "@/lib/payment-info";
import { cn } from "@/lib/utils";
import type { PaymentInitialState, PaymentMethod } from "@/types/order";

type Props = { code: string; total: number; initialState: PaymentInitialState };
type Picked = { file: File; url: string };

const ACCEPT = ["image/jpeg", "image/png", "image/webp"];
// Batas berkas mentah sebelum dikecilkan, supaya foto raksasa tidak menghabiskan memori HP.
const MAX_INPUT_BYTES = 20 * 1024 * 1024;
const TOO_BIG = "Ukuran gambar maksimal 2 MB.";

const METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "transfer", label: "Transfer bank" },
  { value: "qris", label: "QRIS" },
];

const primaryButton =
  "min-h-12 w-full rounded-full bg-ink px-4 text-base font-semibold text-paper transition-colors duration-150 hover:bg-brand-strong focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-card focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-line disabled:text-muted";
const textButton =
  "min-h-11 font-semibold text-ink underline underline-offset-4 hover:text-brand-strong focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none rounded";

// Panel pembayaran manual (F3) dengan data rekening dan QRIS CONTOH. Mandiri: dipakai
// di layar sukses checkout dan nanti di halaman lacak pesanan (F4). Status pesanan
// tidak diubah di sini; "Bukti terkirim" hanya dari waktu unggah.
export default function PaymentPanel({ code, total, initialState }: Props) {
  const id = useId();
  const [method, setMethod] = useState<PaymentMethod>(initialState.paymentMethod ?? "transfer");
  const [picked, setPicked] = useState<Picked | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [sentAt, setSentAt] = useState(initialState.proofUploadedAt);
  const [count, setCount] = useState(initialState.proofUploadCount);
  const [replacing, setReplacing] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  const pickToken = useRef(0);
  const sentRef = useRef<HTMLParagraphElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const focusAfter = useRef<"sent" | "file" | null>(null);

  const showForm = !sentAt || replacing;

  // Lepas URL pratinjau lama supaya memori tidak bocor.
  useEffect(() => () => void (picked && URL.revokeObjectURL(picked.url)), [picked]);

  // Fokus dipindah setelah tampilan berganti, supaya fokus tidak hilang ke body.
  useEffect(() => {
    if (focusAfter.current === "sent") sentRef.current?.focus();
    if (focusAfter.current === "file") fileRef.current?.focus();
    focusAfter.current = null;
  }, [sentAt, replacing]);

  const copyAccount = async () => {
    try {
      await navigator.clipboard.writeText(BANK_TRANSFER.accountNumber.replace(/\s/g, ""));
      setCopyStatus("Nomor rekening tersalin.");
    } catch {
      setCopyStatus("Gagal menyalin. Salin nomor rekening secara manual.");
    }
  };

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Dikosongkan supaya memilih berkas yang sama lagi tetap memicu onChange.
    e.target.value = "";
    if (!file) return;
    const token = ++pickToken.current;
    setError("");
    setPicked(null);

    if (!ACCEPT.includes(file.type)) return setError("Berkas harus berupa gambar JPG, PNG, atau WebP.");
    if (file.size > MAX_INPUT_BYTES) return setError(TOO_BIG);

    setPreparing(true);
    const small = await compressImage(file);
    if (token !== pickToken.current) return; // sudah diganti pilihan yang lebih baru
    setPreparing(false);
    // Pakai hasil kecil bila memang lebih kecil; bila gagal dikecilkan, berkas asli.
    const out = small && small.size < file.size ? small : file;
    if (out.size > MAX_PROOF_BYTES) return setError(TOO_BIG);
    setPicked({ file: out, url: URL.createObjectURL(out) });
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (pending || preparing || !picked) return; // tanpa kirim ganda
    setPending(true);
    setError("");
    try {
      const data = new FormData();
      data.append("code", code);
      data.append("method", method);
      data.append("file", picked.file);
      const result = await uploadPaymentProof(data);
      if (result.status === "error") return setError(result.message);
      focusAfter.current = "sent";
      setSentAt(result.uploadedAt);
      setCount(result.uploadCount);
      setReplacing(false);
      setPicked(null);
    } catch {
      // Metode dan gambar terpilih tetap, jadi cukup tekan kirim lagi.
      setError("Bukti bayar gagal dikirim. Periksa koneksi Anda lalu coba lagi.");
    } finally {
      setPending(false);
    }
  };

  return (
    <section aria-labelledby={`${id}-judul`} className="rounded-card border border-line bg-card p-4 text-base md:p-6">
      <h3 id={`${id}-judul`} className="text-base font-semibold">
        Pembayaran
      </h3>
      <p className="mt-2 text-muted">Jumlah yang harus dibayar</p>
      <p className="text-3xl font-bold">{formatRupiah(total)}</p>

      <fieldset className="mt-4">
        <legend className="font-semibold">Metode pembayaran</legend>
        {/* Radio bawaan: panah kiri dan kanan memindah pilihan, Spasi memilih. */}
        <div className="mt-2 grid grid-cols-2 gap-1 rounded-full border border-line bg-paper p-1">
          {METHODS.map((m) => (
            <label key={m.value} className="relative">
              <input
                type="radio"
                name={`${id}-metode`}
                value={m.value}
                checked={method === m.value}
                onChange={() => setMethod(m.value)}
                className="peer sr-only"
              />
              <span className="flex min-h-11 cursor-pointer items-center justify-center rounded-full px-1 font-semibold whitespace-nowrap text-ink transition-colors duration-150 peer-checked:bg-ink peer-checked:text-paper peer-focus-visible:ring-2 peer-focus-visible:ring-brand peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-paper hover:text-brand-strong peer-checked:hover:text-paper">
                {m.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-4">
        {method === "transfer" ? (
          <dl className="divide-y divide-line">
            <div className="flex flex-wrap justify-between gap-x-4 py-2">
              <dt className="text-muted">Bank</dt>
              <dd className="font-semibold">{BANK_TRANSFER.bankName}</dd>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2">
              <dt className="text-muted">Nomor rekening</dt>
              <dd className="flex items-center gap-3">
                <span className="font-mono text-lg font-bold tracking-wider">{BANK_TRANSFER.accountNumber}</span>
                <button
                  type="button"
                  onClick={copyAccount}
                  className="min-h-11 rounded-full border border-line bg-paper px-4 font-semibold hover:border-ink focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
                >
                  Salin
                </button>
              </dd>
            </div>
            <div className="flex flex-wrap justify-between gap-x-4 py-2">
              <dt className="text-muted">Atas nama</dt>
              <dd className="font-semibold">{BANK_TRANSFER.accountHolder}</dd>
            </div>
          </dl>
        ) : (
          <Image
            src={QRIS_IMAGE}
            alt="QRIS Nasi Padang Nan Tujuah (gambar contoh, tidak dapat dipindai)"
            width={1080}
            height={1080}
            sizes="320px"
            className="mx-auto h-auto w-full max-w-80 rounded-card border border-line"
          />
        )}
        <p aria-live="polite" className="text-right text-muted">
          {method === "transfer" ? copyStatus : ""}
        </p>
      </div>

      <div className="mt-4 border-t border-line pt-4">
        <div aria-live="polite">
          {sentAt && !replacing && (
            <div>
              <p ref={sentRef} tabIndex={-1} className="font-semibold focus:outline-none">
                Bukti bayar terkirim. Menunggu verifikasi admin.
              </p>
              <p className="mt-1 text-muted">Dikirim {formatDateTime(sentAt)}</p>
            </div>
          )}
        </div>

        {sentAt && !replacing && (
          count < MAX_PROOF_UPLOADS ? (
            <button
              type="button"
              onClick={() => {
                focusAfter.current = "file";
                setError("");
                setReplacing(true);
              }}
              className={cn(textButton, "mt-2")}
            >
              Ganti bukti bayar
            </button>
          ) : (
            <p className="mt-2 text-muted">Bukti bayar sudah diunggah 3 kali dan tidak bisa diganti lagi.</p>
          )
        )}

        {showForm && (
          <form onSubmit={submit} noValidate>
            <p id={`${id}-label`} className="font-semibold">
              Unggah bukti bayar
            </p>
            <p id={`${id}-hint`} className="mt-1 text-muted">
              JPG, PNG, atau WebP. Maksimal 2 MB.
            </p>
            <p className="mt-1 text-muted">Jangan unggah data sensitif selain bukti transfer.</p>

            {/* Input asli disembunyikan, labelnya tampil sebagai tombol besar. Tanpa
                atribut capture, jadi HP menawarkan galeri dan kamera. */}
            <label className="mt-3 flex min-h-12 cursor-pointer items-center justify-center rounded-full border border-ink bg-paper px-4 font-semibold text-ink transition-colors duration-150 hover:border-brand-strong hover:text-brand-strong has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-card">
              <input
                ref={fileRef}
                type="file"
                accept={ACCEPT.join(",")}
                onChange={onPick}
                disabled={pending}
                aria-labelledby={`${id}-label`}
                aria-describedby={`${id}-hint`}
                className="sr-only"
              />
              <span aria-hidden>{preparing ? "Menyiapkan gambar..." : picked ? "Pilih gambar lain" : "Pilih gambar"}</span>
            </label>

            {picked && (
              <div className="mt-3 flex items-center gap-3">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-line bg-paper">
                  {/* URL blob lokal, jadi tanpa optimasi server. */}
                  <Image src={picked.url} alt="Pratinjau bukti bayar" fill unoptimized className="object-cover" />
                </div>
                <p className="text-muted">Gambar siap dikirim ({Math.max(1, Math.round(picked.file.size / 1024))} KB)</p>
              </div>
            )}

            {error && (
              <p role="alert" className="mt-3 font-semibold text-brand-strong">
                {error}
              </p>
            )}

            <button type="submit" disabled={!picked || pending || preparing} className={cn(primaryButton, "mt-4")}>
              {pending ? "Mengirim..." : "Kirim bukti bayar"}
            </button>
            {replacing && (
              <button
                type="button"
                onClick={() => {
                  setReplacing(false);
                  setPicked(null);
                  setError("");
                }}
                className={cn(textButton, "mt-2 w-full")}
              >
                Batal ganti
              </button>
            )}
          </form>
        )}
      </div>
    </section>
  );
}
