// src/app/student/payments/page.tsx
"use client";

import { useState, useEffect } from "react";
import { MobileTopBar } from "@/components/shared/mobile-top-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { Wallet } from "lucide-react";

interface Order { public_id: string; purchase_type: string; amount: string; status: string; created_at: string }

const statusColor: Record<string, string> = {
  paid: "bg-emerald-100 text-emerald-700", pending: "bg-amber-100 text-amber-700",
  failed: "bg-red-100 text-red-700", refunded: "bg-slate-100 text-slate-500",
};

export default function StudentPaymentsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/student/payments").then((r) => r.json()).then((d) => setOrders(d.results || [])).finally(() => setIsLoading(false));
  }, []);

  return (
    <>
      <MobileTopBar firstName="" lastName="" role="student" />
      <div className="pt-24 px-4 pb-5 w-full overflow-x-hidden">
        <h1 className="text-lg font-bold text-slate-900 mb-4">Payment History</h1>
        {isLoading ? (
          <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <Wallet className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No payments yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {orders.map((o) => (
              <div key={o.public_id} className="bg-white rounded-2xl p-3.5 shadow-sm flex items-center justify-between min-w-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium capitalize truncate">{o.purchase_type.replace("_", " ")}</p>
                  <p className="text-xs text-slate-400">{formatDate(o.created_at)}</p>
                </div>
                <div className="text-right shrink-0 pl-2">
                  <p className="text-sm font-bold">{formatCurrency(o.amount)}</p>
                  <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize", statusColor[o.status])}>{o.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
