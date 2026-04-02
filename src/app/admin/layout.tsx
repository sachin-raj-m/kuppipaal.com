import AdminSidebar from "@/components/AdminSidebar";
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "ADMIN") redirect("/delivery");

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <AdminSidebar />

      <main className="flex-1 min-w-0 overflow-auto md:h-screen flex flex-col">
        {/* Top header — desktop only shows name/user; mobile shows logo + username */}
        <header className="h-14 md:h-16 border-b border-slate-200 bg-white sticky top-0 z-10 px-4 md:px-8 flex items-center justify-between shadow-sm shrink-0">
          <div className="flex items-center gap-2 md:hidden">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">K</span>
            </div>
            <span className="font-bold text-slate-800 text-base">Kuppipaal.com</span>
          </div>
          <h2 className="hidden md:block text-xl font-semibold text-slate-800">Kuppipaal.com</h2>
          <span className="text-xs md:text-sm font-medium text-slate-600 bg-slate-100 px-2.5 md:px-3 py-1 md:py-1.5 rounded-full border border-slate-200 max-w-[140px] md:max-w-none truncate">
            {profile?.full_name || user.email}
          </span>
        </header>

        {/* Page content — extra bottom padding on mobile for the tab bar */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
