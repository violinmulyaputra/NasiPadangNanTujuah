import type { Metadata } from "next";
import AdminLoginForm from "@/components/AdminLoginForm";

export const metadata: Metadata = { title: "Masuk" };

export default function AdminLoginPage() {
  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-12 md:py-20">
      <h1 className="text-center font-display text-3xl font-bold text-ink">
        Masuk <span className="text-brand">Admin</span>
      </h1>
      <p className="mt-2 text-center text-muted">Khusus pengelola Nasi Padang Nan Tujuah.</p>
      <AdminLoginForm />
    </main>
  );
}
