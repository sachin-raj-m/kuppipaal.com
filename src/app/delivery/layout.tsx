import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Droplet } from "lucide-react";
import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default async function DeliveryLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <header className="h-16 bg-slate-900 border-b border-slate-800 text-white flex items-center justify-between px-6 sticky top-0 z-20 shadow-md">
        <Link href="/delivery" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Droplet className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg hidden sm:block">
            Kuppipaal.com <span className="text-slate-400 font-normal text-sm">| Delivery</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="bg-slate-800 px-3 py-1.5 rounded-full flex items-center gap-2 border border-slate-700">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-slate-300">{profile?.full_name || user.email}</span>
          </div>
          <LogoutButton />
        </div>
      </header>
      <main className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
