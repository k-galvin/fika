"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { useTheme } from "@/app/theme-context";
import { cn } from "@/lib/utils";

type Tab = {
  href: string;
  label: string;
  icon: string;
  darkIcon?: string;
  isActive: (pathname: string) => boolean;
};

// Thumb-reachable primary navigation for phones / the home-screen web app.
// Hidden from md and up, where the top nav bar takes over.
export function MobileTabBar({ user }: { user: User | null }) {
  const pathname = usePathname() || "/";
  const { isAfterHours } = useTheme();

  const tabs: Tab[] = [
    {
      href: "/",
      label: "home",
      icon: "/cardamomBun.png",
      isActive: (p) => p === "/",
    },
    {
      href: "/discover",
      label: "discover",
      icon: "/hotMatchaLatte.png",
      isActive: (p) => p.startsWith("/discover") || p.startsWith("/cafe"),
    },
    ...(user
      ? [
          {
            href: "/journal",
            label: "journal",
            icon: "/cakeSlice.png",
            isActive: (p: string) => p.startsWith("/journal"),
          },
          {
            href: "/profile",
            label: "profile",
            icon: "/person.png",
            darkIcon: "/personDark.png",
            isActive: (p: string) =>
              p.startsWith("/profile") || p.startsWith("/friend"),
          },
        ]
      : [
          {
            href: `/auth/login?redirect=${pathname}`,
            label: "sign in",
            icon: "/person.png",
            darkIcon: "/personDark.png",
            isActive: (p: string) => p.startsWith("/auth"),
          },
        ]),
  ];

  return (
    <nav
      aria-label="Primary"
      className="md:hidden fixed inset-x-0 bottom-0 z-50 bg-background/90 backdrop-blur-md border-t border-primary/10 pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="flex items-stretch justify-around h-[var(--tabbar-height)] px-2">
        {tabs.map((tab) => {
          const active = tab.isActive(pathname);
          const icon = isAfterHours && tab.darkIcon ? tab.darkIcon : tab.icon;
          return (
            <li key={tab.label} className="flex-1">
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "h-full flex flex-col items-center justify-center gap-0.5 font-kate font-bold text-sm lowercase tracking-wide transition-all duration-200 active:scale-95 select-none",
                  active ? "text-primary" : "text-primary/50"
                )}
              >
                <span
                  className={cn(
                    "relative h-8 w-8 transition-all duration-200",
                    active ? "opacity-100 -translate-y-0.5" : "opacity-60 grayscale-[40%]"
                  )}
                >
                  <Image
                    src={icon}
                    alt=""
                    fill
                    sizes="32px"
                    className="object-contain"
                  />
                </span>
                <span className="relative leading-none">
                  {tab.label}
                  <span
                    className={cn(
                      "absolute -bottom-1 left-0 h-px bg-primary/50 transition-all duration-300",
                      active ? "w-full" : "w-0"
                    )}
                  />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
