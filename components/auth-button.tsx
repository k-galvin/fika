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
      <Button asChild variant="outline" size="sm">
        <Link href="/profile" aria-label="Profile">
          <UserIcon className="size-4" />
          <span className="ml-2">{displayName}</span>
        </Link>
      </Button>
      <Button onClick={logout}>Logout</Button>
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"outline"}>
        <Link href={`/auth/login?redirect=${pathname}`}>Sign in</Link>
      </Button>
    </div>
  );
}
