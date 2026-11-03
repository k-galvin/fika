import Link from "next/link";

export function NavBarFallback() {
  return (
    <div className="sticky top-0 z-50 w-full bg-background/60 backdrop-blur-md border-b border-primary/5 transition-all duration-300 pt-[env(safe-area-inset-top)]">
      <nav className="w-full max-w-5xl mx-auto px-6 py-2 md:py-4">
        <div className="flex justify-center md:justify-between items-center relative">
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
              className="font-kate font-bold text-4xl md:text-5xl text-primary hover:opacity-70 transition-all duration-300 tracking-tighter"
            >
              fika
            </Link>
          </div>

          {/* Right Side: Auth Placeholder (Skeleton) */}
          <div className="hidden md:flex flex-1 justify-end items-center">
            <div className="h-10 w-24 bg-primary/5 animate-pulse rounded-xl border-1.5 border-dashed border-primary/10" />
          </div>
        </div>
      </nav>
      {/* Mobile tab bar placeholder */}
      <div className="md:hidden fixed inset-x-0 bottom-0 z-50 bg-background/90 backdrop-blur-md border-t border-primary/10 pb-[env(safe-area-inset-bottom)]">
        <div className="h-[var(--tabbar-height)]" />
      </div>
    </div>
  );
}
