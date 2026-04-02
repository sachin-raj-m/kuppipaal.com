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

function formatPaymentStatus(status: string): string {
  return status.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

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
      if (res.ok) {
        const data = await res.json();
        setBills(data);
      } else {
        const err = await res.json();
        notify("error", err.error || "Failed to load bills.");
      }
    } catch {
      notify("error", "Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
        notify("success", `Successfully generated/updated ${data.count} bills.`);
        await fetchBills();
      } else {
        const err = await res.json();
        notify("error", err.error || "Failed to generate bills.");
      }
    } catch {
      notify("error", "Network error. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      {notif && (
        <div
          className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium border ${
            notif.type === "success"
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-red-50 text-red-700 border-red-200"
          }`}
        >
          {notif.type === "success" ? (
            <CheckCheck className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          {notif.msg}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between sm:items-center bg-slate-50/50">
          <div className="flex gap-4 items-center">
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="border border-slate-300 rounded-lg py-2 px-3 text-sm text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {new Date(0, m - 1).toLocaleString("en", { month: "long" })}
                </option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="border border-slate-300 rounded-lg py-2 px-3 text-sm text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <button
              onClick={fetchBills}
              className="p-2 text-slate-500 hover:text-blue-600 transition-colors hover:bg-slate-100 rounded-lg"
              title="Refresh List"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>

          {confirmGenerate ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Generate bills for {new Date(0, parseInt(month) - 1).toLocaleString("en", { month: "long" })} {year}?</span>
              <button
                onClick={handleGenerate}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                Yes, Generate
              </button>
              <button
                onClick={() => setConfirmGenerate(false)}
                className="bg-slate-100 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmGenerate(true)}
              disabled={isGenerating}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-all shadow-sm font-medium text-sm disabled:opacity-70"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              {isGenerating ? "Generating..." : "Generate Bills"}
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
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
              {bills.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <ReceiptIndianRupee className="w-8 h-8 text-slate-300" />
                      <p>No bills found for the selected month.</p>
                      <p className="text-xs text-slate-400">Click Generate Bills to calculate from deliveries.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                bills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{bill.customer.name}</div>
                      <div className="text-xs text-slate-500">{bill.customer.route.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col text-sm">
                        <span className="text-slate-600">Milk: {Number(bill.total_milk_quantity)} L</span>
                        <span className="text-slate-600">Curd: {Number(bill.total_curd_quantity)} L</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-bold text-slate-800">₹{Number(bill.total_amount).toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                          bill.payment_status === "paid"
                            ? "bg-green-100 text-green-700"
                            : bill.payment_status === "unpaid"
                            ? "bg-red-100 text-red-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {formatPaymentStatus(bill.payment_status)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
