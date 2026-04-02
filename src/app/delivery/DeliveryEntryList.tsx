"use client";

import { useState, useRef, useEffect } from "react";
import {
  Loader2,
  Save,
  CheckCheck,
  AlertCircle,
  Plus,
  MapPin,
  X,
  MinusCircle,
  Milk,
  Package,
  StickyNote,
} from "lucide-react";
import type { DeliveryStatus, DeliveryRecord } from "@/lib/types";

type Customer = {
  id: string;
  name: string;
  address: string;
  defaultMilkQuantity: string | number;
  defaultCurdQuantity: string | number;
  route: { name: string };
};

type Notif = { type: "success" | "error"; msg: string };

function DeliveryModal({
  customer,
  entry,
  onClose,
  onSave,
}: {
  customer: Customer;
  entry: DeliveryRecord;
  onClose: () => void;
  onSave: (updated: DeliveryRecord) => void;
}) {
  const [local, setLocal] = useState<DeliveryRecord>({ ...entry });

  const set = <K extends keyof DeliveryRecord>(field: K, value: DeliveryRecord[K]) =>
    setLocal((prev) => ({ ...prev, [field]: value }));

  const totalMilk = local.milkQuantity + local.extraMilkQuantity;
  const totalCurd = local.curdQuantity + local.extraCurdQuantity;
  const hasExtra = local.extraMilkQuantity > 0 || local.extraCurdQuantity > 0;

  // Close on backdrop click
  const backdropRef = useRef<HTMLDivElement>(null);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
    >
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">
        {/* Handle bar (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-slate-300" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-4 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-800">{customer.name}</h2>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 shrink-0" />
              {customer.address} &bull; {customer.route.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors shrink-0 mt-0.5"
          >
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-5 overflow-y-auto max-h-[70vh]">
          {/* Quantities */}
          <div className="space-y-3">
            {/* Regular quantities */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  <Milk className="w-3.5 h-3.5 text-sky-500" /> Milk (L)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={local.milkQuantity}
                  onChange={(e) => set("milkQuantity", parseFloat(e.target.value) || 0)}
                  className="border border-slate-300 rounded-xl px-3 py-2 text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 outline-none w-full font-semibold text-base"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-yellow-500" /> Curd (L)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={local.curdQuantity}
                  onChange={(e) => set("curdQuantity", parseFloat(e.target.value) || 0)}
                  className="border border-slate-300 rounded-xl px-3 py-2 text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 outline-none w-full font-semibold text-base"
                />
              </div>
            </div>

            {/* Extra quantities */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-blue-500 flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Extra Milk (L)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={local.extraMilkQuantity}
                  onChange={(e) => set("extraMilkQuantity", parseFloat(e.target.value) || 0)}
                  className="border border-blue-200 rounded-xl px-3 py-2 text-slate-800 bg-blue-50 focus:ring-2 focus:ring-blue-500 outline-none w-full font-semibold text-base"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-blue-500 flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Extra Curd (L)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={local.extraCurdQuantity}
                  onChange={(e) => set("extraCurdQuantity", parseFloat(e.target.value) || 0)}
                  className="border border-blue-200 rounded-xl px-3 py-2 text-slate-800 bg-blue-50 focus:ring-2 focus:ring-blue-500 outline-none w-full font-semibold text-base"
                />
              </div>
            </div>

            {/* Totals */}
            {hasExtra && (
              <div className="flex items-center gap-4 bg-slate-50 rounded-xl px-4 py-2.5 border border-slate-100 text-sm">
                <span className="text-slate-500 font-medium text-xs">Total today:</span>
                <span className="font-bold text-slate-800">{totalMilk.toFixed(1)} L milk</span>
                <span className="font-bold text-slate-800">{totalCurd.toFixed(1)} L curd</span>
              </div>
            )}
          </div>

          {/* Skip toggle */}
          <button
            onClick={() =>
              set("status", local.status === "skipped" ? "delivered" : "skipped")
            }
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-sm font-medium ${
              local.status === "skipped"
                ? "bg-orange-50 border-orange-300 text-orange-700"
                : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
            }`}
          >
            <MinusCircle className={`w-4 h-4 ${local.status === "skipped" ? "text-orange-500" : "text-slate-400"}`} />
            {local.status === "skipped" ? "Marked as Skipped — tap to undo" : "Mark as Skipped (holiday / not at home)"}
          </button>

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
              <StickyNote className="w-3.5 h-3.5" /> Notes (optional)
            </label>
            <input
              type="text"
              placeholder="Add a note..."
              value={local.notes || ""}
              onChange={(e) => set("notes", e.target.value)}
              className="border border-slate-300 rounded-xl px-3 py-2 text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 outline-none w-full text-sm placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Footer action */}
        <div className="px-5 py-4 border-t border-slate-100 bg-slate-50">
          <button
            onClick={() => { onSave(local); onClose(); }}
            className="w-full bg-blue-600 text-white py-3 rounded-2xl font-semibold text-base hover:bg-blue-700 active:scale-[0.98] transition-all shadow-md"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DeliveryEntryList({
  initialCustomers,
  initialDeliveries,
}: {
  initialCustomers: Customer[];
  initialDeliveries: DeliveryRecord[];
}) {
  const [entries, setEntries] = useState<Record<string, DeliveryRecord>>(() => {
    const map: Record<string, DeliveryRecord> = {};
    initialCustomers.forEach((c) => {
      const existing = initialDeliveries.find((d) => d.customerId === c.id);
      if (existing) {
        map[c.id] = { ...existing };
      } else {
        map[c.id] = {
          customerId: c.id,
          milkQuantity: Number(c.defaultMilkQuantity),
          extraMilkQuantity: 0,
          curdQuantity: Number(c.defaultCurdQuantity),
          extraCurdQuantity: 0,
          status: "not_delivered",
          notes: "",
        };
      }
    });
    return map;
  });

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [notif, setNotif] = useState<Notif | null>(null);
  const [modalCustomerId, setModalCustomerId] = useState<string | null>(null);
  const notifTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notify = (type: "success" | "error", msg: string) => {
    if (notifTimer.current) clearTimeout(notifTimer.current);
    setNotif({ type, msg });
    notifTimer.current = setTimeout(() => setNotif(null), 4000);
  };

  const toggleDelivered = (customerId: string) => {
    setEntries((prev) => {
      const current = prev[customerId];
      // If skipped, leave as is (user must open modal to change)
      if (current.status === "skipped") return prev;
      return {
        ...prev,
        [customerId]: {
          ...current,
          status: current.status === "delivered" ? "not_delivered" : "delivered",
        },
      };
    });
  };

  const handleModalSave = (updated: DeliveryRecord) => {
    setEntries((prev) => ({ ...prev, [updated.customerId]: updated }));
  };

  const handleSaveBulk = async () => {
    setIsSaving(true);
    try {
      const payload = Object.values(entries).map((e) => ({
        ...e,
        deliveryDate: new Date().toISOString(),
      }));

      const res = await fetch("/api/deliveries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveries: payload }),
      });

      if (res.ok) {
        setLastSaved(new Date());
        notify("success", "All entries saved successfully!");
      } else {
        const err = await res.json();
        notify("error", err.error || "Failed to save entries.");
      }
    } catch {
      notify("error", "Network error. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const modalCustomer = modalCustomerId
    ? initialCustomers.find((c) => c.id === modalCustomerId) ?? null
    : null;

  if (initialCustomers.length === 0) {
    return (
      <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 text-center flex flex-col items-center">
        <CheckCheck className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-semibold text-slate-700">No Customers Assigned</h2>
        <p className="text-slate-500 mt-2">You don&apos;t have any customers on your route today.</p>
      </div>
    );
  }

  const deliveredCount = Object.values(entries).filter((e) => e.status === "delivered").length;
  const total = initialCustomers.length;

  return (
    <>
      {/* Modal */}
      {modalCustomer && (
        <DeliveryModal
          customer={modalCustomer}
          entry={entries[modalCustomer.id]}
          onClose={() => setModalCustomerId(null)}
          onSave={handleModalSave}
        />
      )}

      <div className="space-y-4">
        {notif && (
          <div
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border ${
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

        {/* Header + progress */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-bold text-slate-800">Quick Entry List</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {deliveredCount} of {total} delivered
              </p>
            </div>
            <div className="flex items-center gap-2">
              {lastSaved && (
                <span className="text-xs text-slate-400 hidden sm:block">
                  Saved {lastSaved.toLocaleTimeString()}
                </span>
              )}
              <button
                onClick={handleSaveBulk}
                disabled={isSaving}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-all shadow font-medium text-sm disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isSaving ? "Saving..." : "Save All"}
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-500"
              style={{ width: `${total > 0 ? (deliveredCount / total) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Checklist */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 divide-y divide-slate-100 overflow-hidden">
          {initialCustomers.map((customer) => {
            const entry = entries[customer.id];
            if (!entry) return null;

            const isDelivered = entry.status === "delivered";
            const isSkipped = entry.status === "skipped";
            const hasExtra = entry.extraMilkQuantity > 0 || entry.extraCurdQuantity > 0;

            return (
              <div
                key={customer.id}
                className={`flex items-center gap-3 px-4 py-3.5 transition-colors ${
                  isDelivered ? "bg-green-50/50" : isSkipped ? "bg-orange-50/30" : ""
                }`}
              >
                {/* Checkbox */}
                <button
                  onClick={() => toggleDelivered(customer.id)}
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-all active:scale-90 ${
                    isDelivered
                      ? "bg-green-500 border-green-500 shadow-sm shadow-green-200"
                      : isSkipped
                      ? "bg-orange-300 border-orange-300"
                      : "border-slate-300 bg-white hover:border-slate-400"
                  }`}
                  title={isSkipped ? "Skipped — tap customer name to change" : undefined}
                >
                  {isDelivered && (
                    <svg viewBox="0 0 12 10" className="w-3.5 h-3.5 fill-none stroke-white stroke-2">
                      <polyline points="1,5 4.5,8.5 11,1" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  {isSkipped && (
                    <svg viewBox="0 0 12 12" className="w-3 h-3 fill-none stroke-white stroke-2">
                      <line x1="2" y1="6" x2="10" y2="6" strokeLinecap="round" />
                    </svg>
                  )}
                </button>

                {/* Customer info — tap to open modal */}
                <button
                  onClick={() => setModalCustomerId(customer.id)}
                  className="flex-1 min-w-0 text-left"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`font-semibold text-sm leading-tight ${
                        isDelivered
                          ? "text-slate-700 line-through decoration-slate-400"
                          : isSkipped
                          ? "text-slate-400"
                          : "text-slate-800"
                      }`}
                    >
                      {customer.name}
                    </span>
                    {isSkipped && (
                      <span className="text-[10px] font-semibold text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded-full">
                        SKIPPED
                      </span>
                    )}
                    {hasExtra && (
                      <span className="text-[10px] font-semibold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <Plus className="w-2.5 h-2.5" /> EXTRA
                      </span>
                    )}
                    {entry.notes && (
                      <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                        &ldquo;{entry.notes}&rdquo;
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                    <span>
                      {(entry.milkQuantity + entry.extraMilkQuantity).toFixed(1)} L milk
                    </span>
                    {(entry.curdQuantity + entry.extraCurdQuantity) > 0 && (
                      <>
                        <span>&bull;</span>
                        <span>
                          {(entry.curdQuantity + entry.extraCurdQuantity).toFixed(1)} L curd
                        </span>
                      </>
                    )}
                    <span className="text-slate-300">&bull;</span>
                    <span className="text-slate-400 truncate">{customer.route.name}</span>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
