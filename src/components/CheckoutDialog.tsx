"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { createOrder } from "@/lib/actions/order";
import { clear, type CartLine } from "@/lib/cart";
import { formatRupiah } from "@/lib/format";
import { calculateLineTotal } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import PaymentPanel from "@/components/PaymentPanel";
import type { CreateOrderResult, DeliveryZone, OrderField, PaymentInitialState } from "@/types/order";

const NO_PAYMENT_YET: PaymentInitialState = { paymentMethod: null, proofUploadedAt: null, proofUploadCount: 0 };

type Props = {
  lines: CartLine[];
  zones: DeliveryZone[];
  // Naik setiap kali pop-up dibuka (showModal dipanggil di efek).
  openKey: number;
  onClose: () => void;
};

type Success = Extract<CreateOrderResult, { status: "success" }>;
type FormValues = Record<Exclude<OrderField, "items">, string>;

const EMPTY_FORM: FormValues = {
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  deliveryAddress: "",
  deliveryZone: "",
  notes: "",
};

const inputClass =
  "mt-1.5 w-full rounded-xl border border-line bg-paper px-4 py-3 text-base text-ink placeholder:text-muted focus:border-brand focus:ring-2 focus:ring-brand focus:outline-none aria-invalid:border-brand-strong";

// Pop-up checkout di atas panel keranjang (keputusan 2026-11-04). <dialog> modal bawaan
// (sama dengan pop-up menu): focus trap, Escape, aria-modal; kunci scroll lewat
// html:has(dialog[open]). Menutup hanya menutup pop-up ini, panel dan isi keranjang tetap.
export default function CheckoutDialog({ lines, zones, openKey, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  // Isian dipertahankan saat pop-up ditutup lalu dibuka lagi; direset hanya setelah sukses.
  const [values, setValues] = useState(EMPTY_FORM);
  const [success, setSuccess] = useState<Success | null>(null);

  useEffect(() => {
    if (openKey > 0) ref.current?.showModal();
  }, [openKey]);

  const close = () => ref.current?.close();

  return (
    <dialog
      ref={ref}
      aria-labelledby="judul-checkout"
      onClose={() => {
        if (success) {
          setSuccess(null);
          setValues(EMPTY_FORM);
        }
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
      className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-[480px] overflow-y-auto rounded-card bg-paper p-0 text-ink backdrop:bg-ink/50 scale-96 opacity-0 transition-[opacity,scale,display,overlay] transition-discrete duration-250 ease-out open:scale-100 open:opacity-100 starting:open:scale-96 starting:open:opacity-0 motion-reduce:transition-none"
    >
      <div className="relative p-6 md:p-8">
        <button
          type="button"
          aria-label="Tutup"
          onClick={close}
          className="absolute top-3 right-3 inline-flex size-11 items-center justify-center rounded-full text-ink hover:bg-line/50"
        >
          <X aria-hidden className="size-5" />
        </button>
        {success ? (
          <SuccessView order={success} onClose={close} />
        ) : (
          <CheckoutForm
            lines={lines}
            zones={zones}
            values={values}
            setValues={setValues}
            onCancel={close}
            onSuccess={(result) => {
              // Keranjang dikosongkan hanya setelah pesanan benar-benar tersimpan.
              clear();
              setSuccess(result);
            }}
          />
        )}
      </div>
    </dialog>
  );
}

function CheckoutForm({
  lines,
  zones,
  values,
  setValues,
  onCancel,
  onSuccess,
}: {
  lines: CartLine[];
  zones: DeliveryZone[];
  values: FormValues;
  setValues: (fn: (v: FormValues) => FormValues) => void;
  onCancel: () => void;
  onSuccess: (result: Success) => void;
}) {
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<OrderField, string>>>({});
  const [message, setMessage] = useState("");
  const honeypotRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);

  // Hanya tampilan; createOrder menghitung ulang dari database.
  const subtotal = lines.reduce((sum, l) => sum + calculateLineTotal(l.unitPrice, l.quantity), 0);
  const zone = zones.find((z) => z.code === values.deliveryZone);

  const set = (field: keyof FormValues) => (e: { target: { value: string } }) =>
    setValues((v) => ({ ...v, [field]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (pending) return; // tanpa kirim ganda
    setPending(true);
    setMessage("");
    try {
      const result = await createOrder({
        ...values,
        website: honeypotRef.current?.value ?? "",
        // Harga TIDAK dikirim: server membaca harga dari database.
        items: lines.map((l) => ({ menuItemId: l.menuItemId, selections: l.selections, quantity: l.quantity })),
      });
      if (result.status === "success") return onSuccess(result);
      setErrors(result.fieldErrors);
      // Kesalahan keranjang (menu habis atau tidak ada) ditampilkan di atas form.
      setMessage(result.fieldErrors.items ?? result.message);
    } catch {
      setErrors({});
      setMessage("Pesanan gagal dikirim. Periksa koneksi Anda lalu coba lagi.");
    } finally {
      setPending(false);
    }
  };

  // Gulir ke pesan galat agar terlihat di HP.
  useEffect(() => {
    if (message) messageRef.current?.scrollIntoView({ block: "nearest" });
  }, [message]);

  const field = (name: keyof FormValues, label: string, control: (a11y: object) => ReactNode) => {
    const errorId = `galat-${name}`;
    return (
      <div>
        <label htmlFor={`checkout-${name}`} className="text-sm font-semibold">
          {label}
        </label>
        {control({
          id: `checkout-${name}`,
          name,
          value: values[name],
          onChange: set(name),
          "aria-invalid": errors[name] ? true : undefined,
          "aria-describedby": errors[name] ? errorId : undefined,
          className: inputClass,
        })}
        {errors[name] && (
          <p id={errorId} role="alert" className="mt-1 text-sm text-brand-strong">
            {errors[name]}
          </p>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={submit} noValidate>
      <h2 id="judul-checkout" className="font-display text-2xl font-semibold">
        Checkout
      </h2>

      {message && (
        <div ref={messageRef} role="alert" className="mt-4 rounded-xl border border-brand-strong bg-card p-4 text-sm">
          <p className="text-brand-strong">{message}</p>
          {errors.items && (
            <button
              type="button"
              onClick={onCancel}
              className="mt-2 font-semibold text-ink underline underline-offset-4 hover:text-brand-strong"
            >
              Kembali ke keranjang
            </button>
          )}
        </div>
      )}

      <div className="mt-6 space-y-4">
        {field("customerName", "Nama lengkap", (p) => <input {...p} type="text" autoComplete="name" maxLength={60} placeholder="Masukkan nama Anda" />)}
        {field("customerEmail", "Email", (p) => (
          <input {...p} type="email" inputMode="email" autoComplete="email" maxLength={120} placeholder="Masukkan email Anda" />
        ))}
        {field("customerPhone", "Nomor telepon", (p) => (
          <input {...p} type="tel" inputMode="tel" autoComplete="tel" maxLength={20} placeholder="Masukkan nomor telepon Anda" />
        ))}
        {field("deliveryAddress", "Alamat pengiriman", (p) => (
          <textarea {...p} rows={3} autoComplete="street-address" maxLength={200} placeholder="Masukkan alamat pengiriman Anda" className={cn(inputClass, "resize-none")} />
        ))}
        {field("deliveryZone", "Zona pengiriman", (p) => (
          <select {...p}>
            <option value="">Pilih zona pengiriman Anda</option>
            {zones.map((z) => (
              <option key={z.code} value={z.code}>
                {`${z.name} (${formatRupiah(z.fee)})`}
              </option>
            ))}
          </select>
        ))}
        {field("notes", "Catatan (opsional)", (p) => (
          <input {...p} type="text" maxLength={200} placeholder="Masukkan catatan Anda (opsional)" />
        ))}
        {/* Kolom jebakan: tersembunyi dari manusia, bot biasanya mengisinya */}
        <div aria-hidden className="sr-only">
          <input ref={honeypotRef} type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </div>
      </div>

      <div className="mt-6 rounded-xl bg-card p-4">
        <Row label="Subtotal" value={formatRupiah(subtotal)} />
        <Row label="Ongkir" value={zone ? formatRupiah(zone.fee) : "Pilih zona"} />
        <div aria-live="polite" className="mt-2 flex items-center justify-between border-t border-line pt-3">
          <span className="font-semibold">Total</span>
          <span className="text-2xl font-bold">{formatRupiah(subtotal + (zone?.fee ?? 0))}</span>
        </div>
      </div>
      <p className="mt-3 text-xs text-muted">Data Anda hanya dipakai untuk memproses pesanan ini.</p>

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="min-h-12 flex-1 rounded-full border border-line bg-paper px-4 text-sm font-semibold text-ink hover:border-ink"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={pending || lines.length === 0}
          className="min-h-12 flex-1 rounded-full bg-ink px-4 text-sm font-semibold text-paper transition-colors duration-150 hover:bg-brand-strong disabled:cursor-not-allowed disabled:bg-line disabled:text-muted"
        >
          {pending ? "Memproses..." : "Buat Pesanan"}
        </button>
      </div>
    </form>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-0.5 text-sm">
      <span className="text-muted">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function SuccessView({ order, onClose }: { order: Success; onClose: () => void }) {
  const [copyStatus, setCopyStatus] = useState("");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(order.code);
      setCopyStatus("Kode tersalin.");
    } catch {
      setCopyStatus("Gagal menyalin. Salin kode secara manual.");
    }
  };

  return (
    <div>
      <h2 id="judul-checkout" className="font-display text-2xl font-semibold">
        Pesanan dibuat
      </h2>

      <div className="mt-6 rounded-xl bg-card p-4 text-center">
        <p className="text-sm text-muted">Kode pesanan</p>
        <p className="mt-1 font-mono text-3xl font-bold tracking-wider break-all">{order.code}</p>
        <button
          type="button"
          onClick={copy}
          className="mt-3 min-h-10 rounded-full border border-line bg-paper px-5 text-sm font-semibold hover:border-ink"
        >
          Salin kode
        </button>
        <p aria-live="polite" className="mt-2 min-h-5 text-sm text-muted">
          {copyStatus}
        </p>
        <p className="text-sm">Simpan kode ini untuk melacak pesanan Anda.</p>
      </div>

      <p className="mt-4 text-sm">
        Status: <span className="font-semibold">Menunggu pembayaran</span>
      </p>

      <ul className="mt-4 divide-y divide-line">
        {order.items.map((item, i) => (
          <li key={i} className="flex justify-between gap-4 py-2 text-sm">
            <span className="min-w-0">
              {item.quantity} x {item.name}
              {item.optionLabels.length > 0 && (
                <span className="block text-xs text-muted">{item.optionLabels.join(", ")}</span>
              )}
            </span>
            <span className="shrink-0 font-semibold">{formatRupiah(item.lineTotal)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-2 rounded-xl bg-card p-4">
        <Row label="Subtotal" value={formatRupiah(order.subtotal)} />
        <Row label="Ongkir" value={formatRupiah(order.deliveryFee)} />
        <div className="mt-2 flex items-center justify-between border-t border-line pt-3">
          <span className="font-semibold">Total</span>
          <span className="text-2xl font-bold">{formatRupiah(order.total)}</span>
        </div>
      </div>

      <div className="mt-6">
        <PaymentPanel code={order.code} total={order.total} initialState={NO_PAYMENT_YET} />
      </div>

      {/* Bilah tombol menempel di dasar area gulir pop-up, jadi tidak ikut bergeser. */}
      <div className="sticky bottom-0 -mx-6 mt-6 -mb-6 flex flex-col gap-3 border-t border-line bg-paper px-6 py-4 md:-mx-8 md:-mb-8 md:px-8">
        {/* Menutup semua pop-up (checkout dan panel keranjang) lalu pindah halaman;
            pesanan tetap tersimpan. */}
        <Link
          href={`/pesanan/${order.code}`}
          onClick={() => document.querySelectorAll("dialog[open]").forEach((d) => (d as HTMLDialogElement).close())}
          className="flex min-h-12 w-full items-center justify-center rounded-full border border-ink bg-paper px-4 text-sm font-semibold text-ink transition-colors duration-150 hover:border-brand-strong hover:text-brand-strong"
        >
          Lacak pesanan
        </Link>
        <button
          type="button"
          onClick={onClose}
          className="min-h-12 w-full rounded-full bg-ink px-4 text-sm font-semibold text-paper transition-colors duration-150 hover:bg-brand-strong"
        >
          Tutup
        </button>
      </div>
    </div>
  );
}
