// src/app/student/certificates/page.tsx
"use client";

import { useState, useEffect } from "react";
import { MobileTopBar } from "@/components/shared/mobile-top-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { Award, Download, Share2 } from "lucide-react";

interface Certificate {
  public_id: string;
  batch_title: string;
  issued_at: string;
  verification_code: string;
}

export default function StudentCertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [shareMessage, setShareMessage] = useState("");

  useEffect(() => {
    fetch("/api/student/certificates").then((r) => r.json()).then((d) => setCertificates(d.results || [])).finally(() => setIsLoading(false));
  }, []);

  const handleDownload = async (publicId: string) => {
    const res = await fetch(`/api/student/certificates/${publicId}/download`);
    const data = await res.json();
    if (res.ok && data.download_url) {
      window.open(data.download_url, "_blank");
    }
  };

  const handleShare = async (publicId: string) => {
    setShareMessage("");
    const res = await fetch(`/api/student/certificates/${publicId}/share`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ platform: "link" }),
    });
    const data = await res.json();
    if (res.ok && data.share_url) {
      await navigator.clipboard.writeText(data.share_url);
      setShareMessage("Link copied to clipboard!");
    } else {
      setShareMessage("Could not generate share link.");
    }
  };

  return (
    <>
      <MobileTopBar firstName="" lastName="" role="student" />
      <div className="w-full max-w-2xl mx-auto px-4 pt-24 pb-24 lg:pb-8 overflow-x-hidden">
        <h1 className="text-lg font-bold text-slate-900 mb-4">My Certificates</h1>

        {shareMessage && <p className="text-sm text-emerald-600 bg-emerald-50 rounded-xl px-3.5 py-2.5 mb-4">{shareMessage}</p>}

        {isLoading ? (
          <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
        ) : certificates.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <Award className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No certificates earned yet.</p>
            <p className="text-xs text-slate-400 mt-1">Complete a batch to earn your first certificate.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {certificates.map((cert) => (
              <div key={cert.public_id} className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-amber-500 p-2.5 rounded-xl shrink-0">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900 truncate">{cert.batch_title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Issued {formatDate(cert.issued_at)}</p>
                    <p className="text-[10px] text-slate-400 mt-1 font-mono break-all">Code: {cert.verification_code}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => handleDownload(cert.public_id)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-white text-amber-700 text-xs font-semibold py-2.5 rounded-xl border border-amber-200">
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                  <button onClick={() => handleShare(cert.public_id)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-white text-amber-700 text-xs font-semibold py-2.5 rounded-xl border border-amber-200">
                    <Share2 className="w-3.5 h-3.5" /> Share
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
