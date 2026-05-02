"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import { User as UserIcon } from "lucide-react";
import { User } from "@supabase/supabase-js";
import { useState, useEffect } from "react";

export function AuthButton() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", user.id)
          .single();
        setUsername(profile?.username || user.email);
      }
    };
    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          getUser();
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase, supabase.auth]);

  const logout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return user ? (
    <div className="flex items-center gap-6">
      <Button asChild variant="outline" size="sm">
        <Link href="/profile" aria-label="Profile">
          <UserIcon className="size-4" />
          <span className="ml-2">{username}</span>
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
