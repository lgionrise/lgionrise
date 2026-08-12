import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-white flex items-center justify-center px-6">
      <div className="max-w-3xl text-center">

        <div className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-300 mb-8">
          🚀 LGIONRISE
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold mb-6">
          Under Development
        </h1>

        <p className="text-lg md:text-xl text-gray-300 leading-8 mb-10">
          LGIONRISE is currently under development.
          <br />
          This portal is exclusively designed for Teachers and Administrators.
        </p>

        <div className="flex flex-wrap justify-center gap-4">

          <a
            href="/login"
            className="rounded-xl bg-blue-600 px-8 py-4 font-semibold transition hover:bg-blue-700"
          >
            Login to Dashboard
          </a>

          <a
            href="mailto:lgionrise@gmail.com"
            className="rounded-xl border border-gray-600 px-8 py-4 hover:bg-white/10"
          >
            Contact Us
          </a>

        </div>

        <div className="mt-16 text-gray-500 text-sm">
          © 2026 LGIONRISE • All Rights Reserved
        </div>

      </div>
    </main>
  );
}
