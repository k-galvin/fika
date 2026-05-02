"use client";

import { useEffect, useState } from "react";
import { FriendActivity, getFriendActivity } from "@/app/actions";
import Link from "next/link";
import { Coffee, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

export function FriendFeed() {
  const [activity, setActivity] = useState<FriendActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getFriendActivity();
      setActivity(data);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return (
    <div className="w-full max-w-7xl px-5 h-24 flex items-center gap-4 animate-pulse">
        <div className="w-48 h-12 bg-secondary/20 rounded-xl" />
        <div className="w-48 h-12 bg-secondary/20 rounded-xl" />
        <div className="w-48 h-12 bg-secondary/20 rounded-xl" />
    </div>
  );
  
  if (activity.length === 0) return null;

  return (
    <div className="w-full flex flex-col gap-4 overflow-hidden">
      <h3 className="px-5 font-kate font-bold text-primary/40 uppercase tracking-[0.3em] text-[10px]">
        Friends are drinking...
      </h3>
      
      <div className="flex gap-4 overflow-x-auto pb-4 px-5 custom-scrollbar snap-x">
        {activity.map((item) => (
          <Link 
            key={item.id}
            href={`/cafe/${item.cafe_id}`}
            className="flex-shrink-0 snap-start group"
          >
            <div className="flex items-center gap-3 bg-secondary/10 hover:bg-secondary/20 transition-all p-3 rounded-2xl handwritten-border !border-primary/5 shadow-sm min-w-[200px]">
              <div className={cn(
                "p-2 rounded-full",
                item.type === "visit" ? "bg-accent/10 text-accent" : "bg-primary/5 text-primary/60"
              )}>
                {item.type === "visit" ? <Coffee className="size-4" /> : <Bookmark className="size-4" />}
              </div>
              
              <div className="flex flex-col">
                <p className="font-kate text-xs text-primary/60 leading-tight">
                  <span className="font-bold text-primary italic">@{item.username}</span> {item.type === "visit" ? "visited" : "saved"}
                </p>
                <p className="font-kate font-bold text-sm text-primary truncate max-w-[140px]">
                  {item.cafe_name}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
