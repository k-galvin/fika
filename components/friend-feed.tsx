import { getFriendActivity } from "@/app/actions";
import Link from "next/link";
import { Coffee, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

export async function FriendFeed() {
  const activity = await getFriendActivity();
  
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

export function FriendFeedSkeleton() {
  return (
    <div className="w-full flex flex-col gap-4 overflow-hidden animate-pulse">
      <div className="px-5 h-3 w-32 bg-secondary/10 rounded mb-1" />
      <div className="flex gap-4 overflow-x-auto pb-4 px-5">
        <div className="w-48 h-[72px] bg-secondary/10 rounded-2xl flex-shrink-0" />
        <div className="w-48 h-[72px] bg-secondary/10 rounded-2xl flex-shrink-0" />
        <div className="w-48 h-[72px] bg-secondary/10 rounded-2xl flex-shrink-0" />
      </div>
    </div>
  );
}
