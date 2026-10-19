"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Send, Sparkles, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function Header() {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: Sparkles,
      exact: true,
    },
    {
      name: "AI Resume Tailor",
      href: "/resume-tailor",
      icon: FileText,
      exact: false,
    },
    {
      name: "AI Proposal Generator",
      href: "/proposal-generator",
      icon: Send,
      exact: false,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base leading-tight tracking-tight">CraftForge AI</span>
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                Resume & Proposal Studio
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-secondary text-primary font-semibold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 text-xs font-medium border border-emerald-200 dark:border-emerald-900">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Zero-Retention Session</span>
          </div>
        </div>
      </div>
    </header>
  );
}
