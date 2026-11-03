"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <Button
      onClick={logout}
      variant="ghost"
      className={cn(
        "font-kate text-lg font-bold text-destructive/80 hover:bg-destructive/5 handwritten-border !border-destructive/20",
        className
      )}
    >
      log out
    </Button>
  );
}
