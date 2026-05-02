"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import { User as UserIcon } from "lucide-react";
import { User } from "@supabase/supabase-js";
import { useState, useEffect } from "react";

import { Tables } from "@/lib/supabase/database.types";

export function AuthButton({
  initialUser,
  initialProfile,
}: {
  initialUser: User | null;
  initialProfile: Tables<"profiles"> | null;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(initialUser);
  const pathname = usePathname();

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
  };

  const displayName = initialProfile?.username || user?.email;

  return user ? (
    <div className="flex items-center gap-6">
      <Link 
        href="/profile" 
        className="flex items-center gap-2 text-primary/80 hover:text-primary transition-colors group"
      >
        <div className="bg-primary/5 p-1.5 rounded-full group-hover:bg-primary/10 transition-colors">
          <UserIcon className="size-4" />
        </div>
        <span className="font-kate text-lg font-bold">{displayName}</span>
      </Link>
      <Button 
        onClick={logout}
        variant="ghost"
        className="font-kate text-lg text-primary/60 hover:text-destructive/80 hover:bg-destructive/5 transition-all font-bold"
      >
        Logout
      </Button>
    </div>
  ) : (
    <Button asChild variant="ghost" className="font-kate text-lg text-primary/80 hover:bg-primary/5 transition-all handwritten-border !border-primary/20 !rounded-xl px-6 font-bold">
      <Link href={`/auth/login?redirect=${pathname}`}>sign in</Link>
    </Button>
  );
}
