"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { Tables } from "@/lib/supabase/database.types";

export function NavBar({
  user: initialUser,
  authButton,
}: {
  user: User | null;
  profile: Tables<"profiles"> | null;
  authButton: React.ReactNode;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(initialUser);

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

  const logout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    setIsMenuOpen(false);
  };

  return (
    <div className="sticky top-0 z-50 w-full bg-background/60 backdrop-blur-md border-b border-primary/5 transition-all duration-300">
      <nav className="w-full max-w-5xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center relative">
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
              className="font-kate font-bold text-5xl text-primary hover:opacity-70 transition-all duration-300 tracking-tighter"
            >
              fika
            </Link>
          </div>

          {/* Right Side: Auth */}
          <div className="hidden md:flex flex-1 justify-end items-center">
            {authButton}
          </div>

          {/* Mobile Navigation Toggle */}
          <div className="md:hidden">
            <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-lg" className="hover:bg-primary/5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[16rem] mt-2 handwritten-border !border-primary/10 bg-background/95 backdrop-blur-lg p-2">
                <DropdownMenuItem asChild className="font-kate text-2xl px-4 py-3 focus:bg-primary/5">
                  <Link href="/discover">discover</Link>
                </DropdownMenuItem>
                {user ? (
                  <>
                    <DropdownMenuItem asChild className="font-kate text-2xl px-4 py-3 focus:bg-primary/5">
                      <Link href="/journal">journal</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="font-kate text-2xl px-4 py-3 focus:bg-primary/5">
                      <Link href="/profile">profile</Link>
                    </DropdownMenuItem>
                    <div className="h-px bg-primary/5 my-2" />
                    <DropdownMenuItem 
                      onClick={logout}
                      className="font-kate text-2xl px-4 py-3 text-destructive/80 focus:bg-destructive/5 cursor-pointer"
                    >
                      log out
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem asChild className="font-kate text-2xl px-4 py-3 focus:bg-primary/5">
                    <Link href={`/auth/login?redirect=${pathname}`}>sign in</Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>
    </div>
  );
}
