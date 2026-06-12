import Link from "next/link";
import { Button } from "@/components/ui/button";

export function NavBarFallback() {
  return (
    <div className="sticky top-0 z-50 w-full bg-background/60 backdrop-blur-md border-b border-primary/5 transition-all duration-300">
      <nav className="w-full max-w-5xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center relative">
          {/* Left Side: Navigation Placeholders */}
          <div className="hidden md:flex flex-1 justify-start gap-10 items-center font-kate text-primary/70 text-lg">
            <Link
              href="/discover"
              className="hover:text-primary transition-colors relative group uppercase tracking-widest text-sm font-bold"
            >
              discover
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-primary/40 transition-all duration-300 group-hover:w-full" />
            </Link>
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

          {/* Right Side: Auth Placeholder (Skeleton) */}
          <div className="hidden md:flex flex-1 justify-end items-center">
            <div className="h-10 w-24 bg-primary/5 animate-pulse rounded-xl border-1.5 border-dashed border-primary/10" />
          </div>

          {/* Mobile Navigation Toggle Placeholder */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon-lg" className="hover:bg-primary/5" disabled>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-primary/40"
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
            </Button>
          </div>
        </div>
      </nav>
    </div>
  );
}
