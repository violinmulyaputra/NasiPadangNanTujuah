import { Suspense } from "react";
import BestSeller from "@/components/BestSeller";
import Hero from "@/components/Hero";

export default function Home() {
  return (
    <main className="flex-1">
      <Hero />
      {/* Data menu diambil per permintaan; kerangka setinggi seksi menahan tata letak */}
      <Suspense fallback={<div className="min-h-[760px] bg-paper" />}>
        <BestSeller />
      </Suspense>
    </main>
  );
}
