"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Home, Compass, LayoutDashboard, Menu } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";

export default function BottomNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const isActive = (path: string, queryParam?: { key: string; value: string }) => {
    if (pathname !== path) return false;
    if (queryParam) {
      return searchParams.get(queryParam.key) === queryParam.value;
    }
    return true;
  };

  const navItems = [
    {
      label: "Home",
      href: "/",
      icon: Home,
      active: pathname === "/",
    },
    {
      label: "Explore",
      href: "/explore",
      icon: Compass,
      active: pathname === "/explore",
    },
    {
      label: "Dashboard",
      href: "/exchanges",
      icon: LayoutDashboard,
      active: pathname === "/exchanges",
    },
    {
      label: "Account",
      href: "/account",
      icon: Menu,
      active: pathname === "/account",
    },
  ];

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !user) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border md:hidden pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                item.active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon size={20} strokeWidth={item.active ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
