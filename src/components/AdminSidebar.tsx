"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, MapPin, Users, Truck, ReceiptIndianRupee, Settings, LogOut, Droplet, UserCog } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { name: "Dashboard",  href: "/admin",            icon: LayoutDashboard },
  { name: "Routes",     href: "/admin/routes",     icon: MapPin },
  { name: "Customers",  href: "/admin/customers",  icon: Users },
  { name: "Personnel",  href: "/admin/personnel",  icon: UserCog },
  { name: "Deliveries", href: "/admin/deliveries", icon: Truck },
  { name: "Billing",    href: "/admin/billing",    icon: ReceiptIndianRupee },
  { name: "Settings",   href: "/admin/settings",   icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col h-screen shrink-0 sticky top-0 z-20">
      <div className="h-16 flex items-center px-6 border-b border-slate-800 shrink-0">
        <Link href="/admin" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg">
            <Droplet className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-white">Kuppipaal.com</span>
        </Link>
      </div>

      <nav className="flex flex-col gap-1 p-4 flex-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
                isActive ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 shrink-0">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-colors font-medium text-slate-400 text-sm"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
