import { createClient } from "@/lib/supabase/server";
import { getAllUserJournalEntries } from "@/app/actions";
import { Footer } from "@/components/footer";
import Link from "next/link";
import { MapPin, BookOpen, ChevronRight } from "lucide-react";
import { redirect } from "next/navigation";

export default async function JournalPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/journal");
  }

  const entries = await getAllUserJournalEntries();

  return (
    <main className="min-h-screen flex flex-col items-center pt-12 relative overflow-hidden bg-background">
      <div className="w-full flex-1 max-w-5xl px-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <header className="flex flex-col gap-4 mb-16 text-center">
          <h1 className="text-7xl md:text-8xl font-bold font-kate text-primary tracking-tighter leading-none">
            Your Journal
          </h1>
          <p className="text-xl md:text-2xl font-kate italic text-primary/40">
            A continuous log of your cafe discoveries and field notes.
          </p>
        </header>

        <div className="flex flex-col gap-12 pb-24">
          {entries.length === 0 ? (
            <div className="bg-secondary/5 border-2 border-dashed border-primary/10 rounded-3xl p-20 text-center">
              <BookOpen className="size-16 text-primary/10 mx-auto mb-6" />
              <p className="font-kate italic text-primary/40 text-2xl">
                Your journal is waiting for its first entry.
              </p>
              <Link 
                href="/discover"
                className="inline-block mt-8 font-kate font-bold text-lg text-primary hover:opacity-70 transition-all border-b border-primary/20 pb-1"
              >
                Discover places to visit
              </Link>
            </div>
          ) : (
            <div className="relative">
              {/* Vertical line for the feed/journal feel */}
              <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-primary/5 hidden md:block" />

              <div className="flex flex-col gap-12">
                {entries.map((entry, index) => (
                  <div 
                    key={entry.id} 
                    className={`relative flex flex-col md:flex-row gap-8 items-start ${
                      index % 2 === 0 ? "md:flex-row-reverse" : ""
                    }`}
                  >
                    {/* Date circle for desktop */}
                    <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 top-0 size-4 rounded-full bg-background border-2 border-primary/20 z-10" />
                    
                    <div className="w-full md:w-[45%] flex flex-col gap-4">
                      <div className="bg-secondary/10 p-8 rounded-3xl handwritten-border !border-primary/10 shadow-sm hover:shadow-md transition-shadow group">
                        <div className="flex justify-between items-start mb-4">
                          <span className="font-kate text-primary/40 text-sm uppercase tracking-widest font-bold">
                            {new Date(entry.visit_date).toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                              timeZone: "UTC",
                            })}
                          </span>
                        </div>
                        
                        <p className="font-kate text-2xl text-primary/80 whitespace-pre-wrap leading-relaxed mb-6 italic">
                          &ldquo;{entry.content}&rdquo;
                        </p>

                        <Link 
                          href={`/cafe/${entry.coffee_shop_id}`}
                          className="flex items-center justify-between pt-6 border-t border-primary/5 group/link"
                        >
                          <div className="flex flex-col">
                            <span className="font-kate font-bold text-xl text-primary group-hover/link:text-primary/70 transition-colors">
                              {entry.coffee_shops?.name}
                            </span>
                            <div className="flex items-center gap-1 text-primary/30 text-sm font-kate uppercase tracking-tighter">
                              <MapPin className="size-3" />
                              <span>{entry.coffee_shops?.city}</span>
                            </div>
                          </div>
                          <ChevronRight className="size-6 text-primary/20 group-hover/link:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer user={user} />
    </main>
  );
}
