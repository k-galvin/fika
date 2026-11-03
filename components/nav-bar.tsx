"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { Tables } from "@/lib/supabase/database.types";
import { MobileTabBar } from "./mobile-tab-bar";

// Detail pages that get a mobile back button, and where "back" should land
// if the page was opened directly (e.g. from a shared link) with no history.
const BACK_FALLBACKS: { prefix: string; fallback: string }[] = [
  { prefix: "/cafe/", fallback: "/discover" },
  { prefix: "/friend/", fallback: "/profile" },
];

export function NavBar({
  user: initialUser,
  authButton,
}: {
  user: User | null;
  profile: Tables<"profiles"> | null;
  authButton: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(initialUser);

  const backTarget = BACK_FALLBACKS.find(({ prefix }) =>
    pathname.startsWith(prefix)
  );
  const showBack = Boolean(backTarget);

  const goBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else if (backTarget) {
      router.push(backTarget.fallback);
    }
  };

  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
          router.refresh();
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase, router]);

  return (
    <>
      <div className="sticky top-0 z-50 w-full bg-background/60 backdrop-blur-md border-b border-primary/5 transition-all duration-300 pt-[env(safe-area-inset-top)]">
        <nav className="w-full max-w-5xl mx-auto px-6 py-2 md:py-4">
          <div className="flex justify-center md:justify-between items-center relative">
            {/* Mobile: back button on detail pages (home-screen apps have no browser back button) */}
            {showBack && (
              <Button
                variant="ghost"
                size="icon-lg"
                onClick={goBack}
                className="md:hidden absolute -left-3 top-1/2 -translate-y-1/2 text-primary/70 active:scale-95"
              >
                <ChevronLeft className="size-7" />
                <span className="sr-only">Go back</span>
              </Button>
            )}

            {/* Left Side: Navigation */}
            <div className="hidden md:flex flex-1 justify-start gap-10 items-center font-kate text-primary/70 text-lg">
              <Link 
                href="/discover" 
                className="hover:text-primary transition-colors relative group uppercase tracking-widest text-sm font-bold"
              >
                discover
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-primary/40 transition-all duration-300 group-hover:w-full" />
              </Link>
              {user && (
                <Link 
                  href="/journal" 
                  className="hover:text-primary transition-colors relative group uppercase tracking-widest text-sm font-bold"
                >
                  journal
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-primary/40 transition-all duration-300 group-hover:w-full" />
                </Link>
              )}
            </div>

            {/* Center: Brand */}
            <div className="flex-shrink-0">
              <Link 
                href="/" 
                className="font-kate font-bold text-4xl md:text-5xl text-primary hover:opacity-70 transition-all duration-300 tracking-tighter"
              >
                fika
              </Link>
            </div>

            {/* Right Side: Auth */}
            <div className="hidden md:flex flex-1 justify-end items-center">
              {authButton}
            </div>
          </div>
        </nav>
      </div>
      {/* Mobile: bottom tab bar replaces the old hamburger menu */}
      <MobileTabBar user={user} />
    </>
  );
}
