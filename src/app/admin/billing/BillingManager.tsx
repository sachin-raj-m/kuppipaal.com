"use client";

import { useState, useRef } from "react";
import { Loader2, RefreshCw, FileText, ReceiptIndianRupee, CheckCheck, AlertCircle } from "lucide-react";

interface Bill {
  id: string;
  customer: { name: string; route: { name: string } };
  total_milk_quantity: number | string;
  total_curd_quantity: number | string;
  total_amount: number | string;
  payment_status: string;
}

interface BillingManagerProps {
  initialBills: Bill[];
  defaultMonth: number;
  defaultYear: number;
}

type Notif = { type: "success" | "error"; msg: string };

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const statusStyle: Record<string, string> = {
  paid:         "bg-green-100 text-green-700",
  unpaid:       "bg-red-100 text-red-700",
  partial:      "bg-orange-100 text-orange-700",
};

export default function BillingManager({ initialBills, defaultMonth, defaultYear }: BillingManagerProps) {
  const [bills, setBills] = useState<Bill[]>(initialBills);
  const [month, setMonth] = useState(defaultMonth.toString());
  const [year, setYear] = useState(defaultYear.toString());
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notif, setNotif] = useState<Notif | null>(null);
  const [confirmGenerate, setConfirmGenerate] = useState(false);

  const notifTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notify = (type: "success" | "error", msg: string) => {
    if (notifTimer.current) clearTimeout(notifTimer.current);
    setNotif({ type, msg });
    notifTimer.current = setTimeout(() => setNotif(null), 5000);
  };

  const fetchBills = async () => {
    setIsLoading(true);
    setNotif(null);
    try {
      const res = await fetch(`/api/bills/generate?month=${month}&year=${year}`);
      if (res.ok) { setBills(await res.json()); }
      else { const err = await res.json(); notify("error", err.error || "Failed to load bills."); }
    } catch { notify("error", "Network error."); }
    finally { setIsLoading(false); }
  };

  const handleGenerate = async () => {
    setConfirmGenerate(false);
    setIsGenerating(true);
    try {
      const res = await fetch("/api/bills/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month: parseInt(month), year: parseInt(year) }),
      });
      if (res.ok) {
        const data = await res.json();
        notify("success", `${data.count} bills generated.`);
        await fetchBills();
      } else {
        const err = await res.json();
        notify("error", err.error || "Failed to generate bills.");
      }
    } catch { notify("error", "Network error."); }
    finally { setIsGenerating(false); }
  };

  const totalAmount = bills.reduce((s, b) => s + Number(b.total_amount), 0);
  const paidCount = bills.filter((b) => b.payment_status === "paid").length;

  return (
    <div className="space-y-4">
      {notif && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border ${notif.type === "success" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
          {notif.type === "success" ? <CheckCheck className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          {notif.msg}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Controls */}
        <div className="p-4 md:p-6 border-b border-slate-200 bg-slate-50/50 space-y-3">
          {/* Month/year pickers + refresh */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="flex-1 min-w-[120px] border border-slate-300 rounded-xl py-2 px-3 text-sm text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {MONTHS.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
            </select>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="border border-slate-300 rounded-xl py-2 px-3 text-sm text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 outline-none w-24"
            >
              {[2024, 2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            <button onClick={fetchBills} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors" title="Refresh">
              <RefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* Generate / confirm */}
          {confirmGenerate ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl p-3">
              <p className="text-sm text-slate-700 flex-1">
                Generate bills for <strong>{MONTHS[parseInt(month) - 1]} {year}</strong>?
              </p>
              <div className="flex gap-2">
                <button onClick={handleGenerate} className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700">Yes, Generate</button>
                <button onClick={() => setConfirmGenerate(false)} className="bg-white border border-slate-300 text-slate-600 px-4 py-1.5 rounded-lg text-sm font-medium">Cancel</button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmGenerate(true)}
              disabled={isGenerating}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 font-medium text-sm disabled:opacity-70"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              {isGenerating ? "Generating..." : "Generate Bills"}
            </button>
          )}
        </div>

        {/* Summary */}
        {bills.length > 0 && (
          <div className="grid grid-cols-3 border-b border-slate-100">
            <div className="px-4 py-3 text-center border-r border-slate-100">
              <p className="text-xs text-slate-500">Total Bills</p>
              <p className="text-lg font-bold text-slate-800">{bills.length}</p>
            </div>
            <div className="px-4 py-3 text-center border-r border-slate-100">
              <p className="text-xs text-slate-500">Paid</p>
              <p className="text-lg font-bold text-green-600">{paidCount}</p>
            </div>
            <div className="px-4 py-3 text-center">
              <p className="text-xs text-slate-500">Total Amount</p>
              <p className="text-lg font-bold text-slate-800">₹{totalAmount.toFixed(0)}</p>
            </div>
          </div>
        )}

        {/* Bill list */}
        {bills.length === 0 ? (
          <div className="py-14 text-center flex flex-col items-center gap-2 text-slate-400">
            <ReceiptIndianRupee className="w-10 h-10 text-slate-200" />
            <p className="text-sm font-medium">No bills for this month.</p>
            <p className="text-xs text-slate-400">Click Generate Bills to calculate from deliveries.</p>
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="divide-y divide-slate-100 md:hidden">
              {bills.map((bill) => (
                <div key={bill.id} className="px-4 py-3.5 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 text-sm">{bill.customer.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{bill.customer.route.name}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Milk {Number(bill.total_milk_quantity)} L &bull; Curd {Number(bill.total_curd_quantity)} L
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <p className="font-bold text-slate-800 text-sm">₹{Number(bill.total_amount).toFixed(2)}</p>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${statusStyle[bill.payment_status] ?? "bg-slate-100 text-slate-600"}`}>
                      {bill.payment_status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-medium">Customer &amp; Route</th>
                    <th className="px-6 py-4 font-medium">Quantities</th>
                    <th className="px-6 py-4 font-medium text-right">Amount (₹)</th>
                    <th className="px-6 py-4 font-medium text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bills.map((bill) => (
                    <tr key={bill.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">{bill.customer.name}</div>
                        <div className="text-xs text-slate-500">{bill.customer.route.name}</div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="text-slate-600">Milk: {Number(bill.total_milk_quantity)} L</span>
                        <br />
                        <span className="text-slate-600">Curd: {Number(bill.total_curd_quantity)} L</span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-slate-800">
                        ₹{Number(bill.total_amount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold capitalize ${statusStyle[bill.payment_status] ?? "bg-slate-100 text-slate-600"}`}>
                          {bill.payment_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
