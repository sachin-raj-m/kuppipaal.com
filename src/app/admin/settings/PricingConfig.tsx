"use client";

import { useState, useRef } from "react";
import { IndianRupee, Save, CheckCheck, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

type Notif = { type: "success" | "error"; msg: string };

export default function PricingConfig({
  currentMilkPrice,
  currentCurdPrice,
}: {
  currentMilkPrice: number;
  currentCurdPrice: number;
}) {
  const router = useRouter();
  const [milkPrice, setMilkPrice] = useState(currentMilkPrice.toString() || "0");
  const [curdPrice, setCurdPrice] = useState(currentCurdPrice.toString() || "0");
  const [isSaving, setIsSaving] = useState(false);
  const [notif, setNotif] = useState<Notif | null>(null);

  const notifTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notify = (type: "success" | "error", msg: string) => {
    if (notifTimer.current) clearTimeout(notifTimer.current);
    setNotif({ type, msg });
    notifTimer.current = setTimeout(() => setNotif(null), 4000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch("/api/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          milkPrice: parseFloat(milkPrice),
          curdPrice: parseFloat(curdPrice),
        }),
      });

      if (res.ok) {
        notify("success", "Pricing updated successfully.");
        router.refresh();
      } else {
        const error = await res.json();
        notify("error", error.error || "Failed to update pricing.");
      }
    } catch {
      notify("error", "Failed to update pricing. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col gap-6">
      <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
        <IndianRupee className="w-5 h-5 text-green-600" />
        Product Pricing Configuration
      </h2>

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

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700">Milk Price (Per Liter)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">₹</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={milkPrice}
                onChange={(e) => setMilkPrice(e.target.value)}
                className="pl-8 pr-4 py-2 border border-slate-300 rounded-lg w-full text-slate-800 bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700">Curd Price (Per Liter)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">₹</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={curdPrice}
                onChange={(e) => setCurdPrice(e.target.value)}
                className="pl-8 pr-4 py-2 border border-slate-300 rounded-lg w-full text-slate-800 bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            Updating prices affects all future generated bills. Historical bills remain unchanged.
          </p>
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium shrink-0 disabled:opacity-50"
          >
            {isSaving ? (
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
