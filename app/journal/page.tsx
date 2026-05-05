import { createClient } from "@/lib/supabase/server";
import { getAllUserJournalEntries } from "@/app/actions";
import { Footer } from "@/components/footer";
import Link from "next/link";
import Image from "next/image";
import { MapPin, BookOpen } from "lucide-react";
import { redirect } from "next/navigation";

export default async function JournalPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/journal");
  }

  const entries = await getAllUserJournalEntries();

  return (
    <main className="min-h-screen flex flex-col items-center pt-12 relative overflow-hidden bg-background">
      <div className="w-full flex-1 max-w-5xl px-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <header className="flex flex-col gap-4 mb-16 text-center relative">
          <div className="absolute -top-0 -left-10 rotate-[-15deg] hidden lg:block">
            <Image
              src="/swanLatte.png"
              alt="Swan Latte Doodle"
              width={120}
              height={120}
            />
          </div>
          <div className="absolute top-10 -right-20 rotate-[20deg] hidden lg:block">
            <Image
              src="/cakeSlice.png"
              alt="Cake Doodle"
              width={100}
              height={100}
            />
          </div>
          <h1 className="text-7xl md:text-8xl font-bold font-kate text-primary tracking-tighter leading-none">
            Your Journal
          </h1>
          <p className="text-xl md:text-2xl font-kate italic text-primary/40">
            A continuous log of your cafe discoveries and field notes.
          </p>
        </header>

        <div className="pb-24 relative">
          {entries.length === 0 ? (
            <div className="bg-secondary/5 border-2 border-dashed border-primary/10 rounded-3xl p-20 text-center max-w-3xl mx-auto">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 items-start">
              {entries.map((entry) => (
                <div key={entry.id} className="relative group w-full pt-8">
                  {/* Washi Tape - Centered and Overlapping */}
                  <div className="washi-tape top-4 left-1/2 -translate-x-1/2 w-24 h-8 bg-accent/30 rotate-[-2deg] z-20" />

                  <div className="paper-texture bg-secondary/10 p-6 md:p-8 rounded-sm shadow-lg relative overflow-hidden handwritten-border !border-primary/5 min-h-[380px] flex flex-col transition-all duration-300 hover:shadow-xl hover:translate-y-[-4px]">
                    {/* Binder Rings Aesthetic - Slimmer */}
                    <div className="absolute left-2 top-0 bottom-0 binder-rings opacity-20 w-4" />

                    {/* Date Stamp - Smaller */}
                    <div className="flex justify-end mb-6">
                      <div className="border border-primary/10 rounded-full px-3 py-1 rotate-[-3deg] font-kate font-bold text-primary/30 uppercase tracking-[0.1em] text-[10px]">
                        {new Date(entry.visit_date).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            timeZone: "UTC",
                          },
                        )}
                      </div>
                    </div>

                    {/* Journal Content - Responsive sizing */}
                    <div className="pl-4 relative flex-grow">
                      <div className="absolute left-0 top-0 bottom-0 w-px bg-primary/5" />
                      <p className="font-kate text-xl md:text-2xl text-primary/80 whitespace-pre-wrap leading-[1.6] notebook-lines pb-6">
                        {entry.content}
                      </p>
                    </div>

                    {/* Polaroid-style Cafe Link - Compact Polaroid */}
                    <div className="mt-4 flex justify-end">
                      <Link
                        href={`/cafe/${entry.coffee_shop_id}`}
                        className="bg-white p-2 pb-6 shadow-md rotate-[1.5deg] hover:rotate-0 transition-all duration-300 w-[140px] border border-primary/5 group/link"
                      >
                        <div className="aspect-square bg-secondary/10 mb-2 flex items-center justify-center overflow-hidden relative">
                          {(() => {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const photos =
                              (entry.coffee_shops as any)?.shop_photos || [];
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const primaryPhoto =
                              photos.find(
                                (p: any) => p.is_primary && p.is_approved,
                              ) ||
                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
                              photos.find((p: any) => p.is_approved) ||
                              photos[0];

                            if (primaryPhoto?.photo_url) {
                              return (
                                <Image
                                  src={primaryPhoto.photo_url}
                                  alt={entry.coffee_shops?.name || "Cafe"}
                                  fill
                                  className="object-cover group-hover/link:scale-110 transition-transform duration-500"
                                />
                              );
                            }
                            return (
                              <BookOpen className="size-6 text-primary/10 group-hover/link:scale-110 transition-transform" />
                            );
                          })()}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-kate font-bold text-sm text-primary leading-tight truncate">
                            {entry.coffee_shops?.name}
                          </span>
                          <div className="flex items-center gap-0.5 text-primary/30 text-[9px] font-kate uppercase tracking-tighter">
                            <MapPin className="size-2" />
                            <span>{entry.coffee_shops?.city}</span>
                          </div>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer user={user} />
    </main>
  );
}
