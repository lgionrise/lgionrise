// src/app/page.tsx
import Link from "next/link";
import { GraduationCap, Video, BookOpen, Award, ArrowRight, Menu } from "lucide-react";
import { PhotoGallery } from "@/components/landing/photo-gallery";
import { PublicBatchCard } from "@/components/landing/public-batch-card";
import { BrandLogo } from "@/components/shared/brand-logo";

const API_BASE_URL = process.env.DJANGO_API_URL || "https://api.lgion.qalbconverfy.in/api/v1";

async function getPublicBatches() {
  try {
    const res = await fetch(`${API_BASE_URL}/batches/?ordering=-is_featured`, { next: { revalidate: 120 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.results || [];
  } catch {
    return [];
  }
}

export default async function LandingPage() {
  const batches = await getPublicBatches();

  return (
    <main className="bg-slate-50">
      {/* Nav */}
      <nav className="border-b border-slate-200 sticky top-0 bg-white/90 backdrop-blur z-30">
        <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrandLogo size={46} />
            <span className="font-bold text-slate-900">LGIONRISE</span>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <Link href="/batches" className="text-sm font-medium text-slate-600 hover:text-slate-900">Browse Batches</Link>
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">Log In</Link>
            <Link href="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl">
              Get Started
            </Link>
          </div>
          <Link href="/register" className="sm:hidden bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-xl">
            Join
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-5 pt-10 pb-6 text-center">
        <h1 className="text-3xl sm:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
          Learn from the best,<br />grow at your own pace
        </h1>
        <p className="mt-3 text-slate-600 max-w-xl mx-auto text-sm sm:text-base">
          Live classes, recorded lectures, tests, and doubt support — everything you need in one place.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/batches" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3.5 rounded-xl flex items-center justify-center gap-2">
            Explore Batches <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/register" className="w-full sm:w-auto border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold px-6 py-3.5 rounded-xl">
            Create Account
          </Link>
        </div>
      </section>

      {/* Photo Gallery */}
      <section className="max-w-6xl mx-auto px-5 py-8">
        <PhotoGallery />
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-5 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
        {[
          { icon: Video, title: "Live & Recorded Classes", desc: "Join live sessions or catch up anytime with recordings." },
          { icon: BookOpen, title: "Notes & Practice Tests", desc: "Chapter-wise material and tests with instant results." },
          { icon: Award, title: "Certificates & Progress", desc: "Track your growth and earn certificates as you go." },
        ].map((f) => (
          <div key={f.title} className="text-center">
            <div className="bg-indigo-50 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
              <f.icon className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-slate-900">{f.title}</h3>
            <p className="text-sm text-slate-500 mt-1">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Batches — visible without login */}
      <section className="max-w-6xl mx-auto px-5 py-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Our Batches</h2>
          <Link href="/batches" className="text-sm font-semibold text-indigo-600">See all →</Link>
        </div>

        {batches.length === 0 ? (
          <p className="text-slate-500 text-center py-10 text-sm">Batches will appear here soon.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {batches.slice(0, 6).map((batch: any) => (
              <PublicBatchCard key={batch.public_id} batch={batch} />
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 mt-10">
        <div className="max-w-6xl mx-auto px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BrandLogo size={28} />
            <span className="text-sm font-semibold text-slate-700">LGIONRISE</span>
          </div>
          <p className="text-xs text-slate-400">© {new Date().getFullYear()} LGIONRISE. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
