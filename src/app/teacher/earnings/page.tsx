// src/app/teacher/earnings/page.tsx
"use client";

import { useState, useEffect, FormEvent } from "react";
import { EarningsPeriod, Payout } from "@/types/earnings";
import { getErrorMessage, formatCurrency, formatDate } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const payoutStatusStyles: Record<string, string> = {
  queued: "bg-slate-100 text-slate-600",
  processing: "bg-amber-100 text-amber-700",
  processed: "bg-emerald-100 text-emerald-700",
  failed: "bg-red-100 text-red-700",
};

export default function EarningsPage() {
  const [periods, setPeriods] = useState<EarningsPeriod[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [bankForm, setBankForm] = useState({ account_holder_name: "", account_number: "", ifsc_code: "" });
  const [bankMessage, setBankMessage] = useState("");
  const [bankError, setBankError] = useState("");
  const [isSavingBank, setIsSavingBank] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/teacher/earnings").then((r) => r.json()),
      fetch("/api/teacher/payouts").then((r) => r.json()),
    ]).then(([earningsData, payoutsData]) => {
      setPeriods(earningsData.results || []);
      setPayouts(payoutsData.results || []);
    }).finally(() => setIsLoading(false));
  }, []);

  const handleBankSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBankError(""); setBankMessage(""); setIsSavingBank(true);

    const res = await fetch("/api/teacher/bank-account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bankForm),
    });
    const data = await res.json();

    if (!res.ok) { setBankError(getErrorMessage(data.error) || "Failed to save bank details."); setIsSavingBank(false); return; }
    setBankMessage(`Bank account saved — ending in ${data.account_number_last4}.`);
    setBankForm({ account_holder_name: "", account_number: "", ifsc_code: "" });
    setIsSavingBank(false);
  };

  if (isLoading) return <p className="text-slate-500 text-sm">Loading...</p>;

  const latest = periods[0];

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900 mb-6">Earnings & Payouts</h1>

      {latest && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-sm text-slate-500">Total Earnings (latest period)</p>
            <p className="text-2xl font-semibold text-slate-900 mt-1">{formatCurrency(latest.total_earnings)}</p>
            <p className="text-xs text-slate-400 mt-2">
              {formatDate(latest.period_start)} - {formatDate(latest.period_end)}
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-sm text-slate-500">Pending Payout</p>
            <p className="text-2xl font-semibold text-slate-900 mt-1">{formatCurrency(latest.pending_payout_amount)}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="font-semibold text-slate-900 mb-3">Earnings History</h2>
          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
            {periods.map((p, i) => (
              <div key={i} className="px-4 py-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">{formatDate(p.period_start)} - {formatDate(p.period_end)}</span>
                  <span className="font-medium">{formatCurrency(p.total_earnings)}</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Batch: {formatCurrency(p.batch_revenue_share)} • Tuition: {formatCurrency(p.tuition_earnings)}
                </p>
              </div>
            ))}
            {periods.length === 0 && <p className="text-sm text-slate-500 p-4">No earnings recorded yet.</p>}
          </div>

          <h2 className="font-semibold text-slate-900 mb-3 mt-6">Payout History</h2>
          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
            {payouts.map((p) => (
              <div key={p.public_id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div>
                  <p className="font-medium">{formatCurrency(p.amount)}</p>
                  <p className="text-xs text-slate-400">{formatDate(p.period_start)} - {formatDate(p.period_end)}</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${payoutStatusStyles[p.status]}`}>
                  {p.status}
                </span>
              </div>
            ))}
            {payouts.length === 0 && <p className="text-sm text-slate-500 p-4">No payouts yet.</p>}
          </div>
        </div>

        <div>
          <h2 className="font-semibold text-slate-900 mb-3">Bank Account</h2>
          <form onSubmit={handleBankSubmit} className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
            <input
              required placeholder="Account Holder Name" value={bankForm.account_holder_name}
              onChange={(e) => setBankForm({ ...bankForm, account_holder_name: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm"
            />
            <input
              required placeholder="Account Number" value={bankForm.account_number}
              onChange={(e) => setBankForm({ ...bankForm, account_number: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm"
            />
            <input
              required placeholder="IFSC Code" value={bankForm.ifsc_code}
              onChange={(e) => setBankForm({ ...bankForm, ifsc_code: e.target.value.toUpperCase() })}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm"
            />
            {bankError && <p className="text-sm text-red-600">{bankError}</p>}
            {bankMessage && <p className="text-sm text-emerald-600">{bankMessage}</p>}
            <button type="submit" disabled={isSavingBank}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium px-5 py-2.5 rounded-lg text-sm flex items-center gap-2">
              {isSavingBank && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Bank Details
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
