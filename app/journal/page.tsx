import { createClient } from "@/lib/supabase/server";
import { getAllUserJournalEntries } from "@/app/actions";
import { Footer } from "@/components/footer";
import Link from "next/link";
import Image from "next/image";
import { SafeImage } from "@/components/safe-image";
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
  const uniqueCafesCount = new Set(entries.map((e) => e.coffee_shop_id)).size;

  // Group entries chronologically by Month Year
  const groupedEntries = entries.reduce<Record<string, typeof entries>>(
    (acc, entry) => {
      const date = new Date(entry.visit_date);
      const monthYear = date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      });
      if (!acc[monthYear]) {
        acc[monthYear] = [];
      }
      acc[monthYear].push(entry);
      return acc;
    },
    {}
  );

  const monthKeys = Object.keys(groupedEntries);

  return (
    <main className="min-h-dvh flex flex-col items-center pt-6 md:pt-12 relative overflow-hidden bg-background">
      <div className="w-full flex-1 max-w-5xl px-4 md:px-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <header className="flex flex-col gap-2 md:gap-4 mb-8 md:mb-14 text-center relative">
          <div className="absolute -top-2 -left-10 rotate-[-15deg] hidden lg:block opacity-80 pointer-events-none">
            <Image
              src="/swanLatte.png"
              alt="Swan Latte Doodle"
              width={110}
              height={110}
              style={{ width: "auto", height: "auto" }}
            />
          </div>
          <div className="absolute top-8 -right-16 rotate-[20deg] hidden lg:block opacity-80 pointer-events-none">
            <Image
              src="/cakeSlice.png"
              alt="Cake Doodle"
              width={95}
              height={95}
              style={{ width: "auto", height: "auto" }}
            />
          </div>

          <h1 className="text-5xl md:text-8xl font-bold font-kate text-primary tracking-tighter leading-none">
            Your Journal
          </h1>
          <p className="text-lg md:text-2xl font-kate italic text-primary/50 max-w-lg mx-auto">
            A continuous log of your cafe discoveries and field notes.
          </p>

          {entries.length > 0 && (
            <div className="flex justify-center items-center gap-2 mt-1 text-xs md:text-sm font-kate font-bold text-primary/40 uppercase tracking-widest">
              <span>{entries.length} {entries.length === 1 ? "entry" : "entries"}</span>
              <span>•</span>
              <span>{uniqueCafesCount} {uniqueCafesCount === 1 ? "spot" : "spots"}</span>
            </div>
          )}
        </header>

        <div className="pb-20 relative">
          {entries.length === 0 ? (
            <div className="bg-secondary/5 border-2 border-dashed border-primary/10 rounded-2xl md:rounded-3xl p-8 md:p-16 text-center max-w-2xl mx-auto my-6">
              <BookOpen className="size-12 md:size-16 text-primary/20 mx-auto mb-4" />
              <p className="font-kate italic text-primary/60 text-xl md:text-2xl">
                Your journal is waiting for its first entry.
              </p>
              <Link
                href="/discover"
                className="inline-block mt-6 font-kate font-bold text-base md:text-lg text-primary hover:opacity-70 transition-all border-b border-primary/20 pb-0.5"
              >
                Discover places to visit →
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-10 md:gap-14">
              {monthKeys.map((month) => (
                <section key={month} className="flex flex-col gap-5">
                  {/* Month divider */}
                  <div className="flex items-center gap-3">
                    <span className="font-kate font-bold text-xl md:text-2xl text-primary/70 tracking-tight lowercase">
                      ✦ {month}
                    </span>
                    <div className="flex-1 h-px bg-primary/10" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-start">
                    {groupedEntries[month].map((entry, idx) => {
                      const shop = entry.coffee_shops as unknown as {
                        name: string;
                        city: string;
                        shop_photos: {
                          photo_url: string;
                          is_primary: boolean;
                          is_approved: boolean;
                        }[];
                      };
                      const photos = shop?.shop_photos || [];
                      const primaryPhoto =
                        photos.find((p) => p.is_primary && p.is_approved) ||
                        photos.find((p) => p.is_approved) ||
                        photos[0];

                      return (
                        <div key={entry.id} className="relative group w-full pt-4">
                          {/* Washi tape on top */}
                          <div
                            aria-hidden
                            className={`washi-tape top-1 left-1/2 -translate-x-1/2 w-20 md:w-24 h-7 md:h-8 bg-accent/30 z-20 ${
                              idx % 2 === 0 ? "rotate-[-2deg]" : "rotate-[2deg]"
                            }`}
                          />

                          <div className="paper-texture bg-secondary/10 p-5 md:p-6 rounded-sm shadow-sm md:shadow-md relative overflow-hidden handwritten-border !border-primary/10 flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                            {/* Binder Rings Aesthetic - Desktop subtle */}
                            <div className="hidden md:block absolute left-1.5 top-0 bottom-0 binder-rings opacity-15 w-3.5" />

                            {/* Top header: Cafe identity & Date */}
                            <div className="flex items-start justify-between gap-3 mb-4 pb-3 border-b border-primary/10 md:pl-2">
                              <Link
                                href={`/cafe/${entry.coffee_shop_id}`}
                                className="flex items-center gap-2.5 group/cafe min-w-0"
                              >
                                <div className="relative size-11 md:size-12 rounded-sm overflow-hidden bg-secondary/20 shrink-0 border border-primary/10 shadow-xs">
                                  {primaryPhoto?.photo_url ? (
                                    <SafeImage
                                      src={primaryPhoto.photo_url}
                                      alt={entry.coffee_shops?.name || "Cafe"}
                                      fill
                                      sizes="48px"
                                      className="object-cover group-hover/cafe:scale-105 transition-transform duration-300"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <BookOpen className="size-5 text-primary/20" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="font-kate font-bold text-lg md:text-xl text-primary leading-tight truncate group-hover/cafe:opacity-75 transition-opacity">
                                    {entry.coffee_shops?.name}
                                  </span>
                                  {entry.coffee_shops?.city && (
                                    <span className="font-kate text-primary/50 text-xs italic flex items-center gap-1">
                                      <MapPin className="size-2.5 shrink-0" />
                                      <span className="truncate">{entry.coffee_shops?.city}</span>
                                    </span>
                                  )}
                                </div>
                              </Link>

                              <div className="shrink-0 border border-primary/15 rounded-full px-2.5 py-0.5 rotate-[-2deg] font-kate font-bold text-primary/40 uppercase tracking-[0.08em] text-[10px] bg-background/60">
                                {new Date(entry.visit_date).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                  timeZone: "UTC",
                                })}
                              </div>
                            </div>

                            {/* Journal Content with notebook lines */}
                            <div className="relative flex-grow md:pl-2">
                              <p className="font-kate text-base md:text-xl text-primary/85 whitespace-pre-wrap leading-[1.65] notebook-lines pb-3">
                                {entry.content}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer user={user} />
    </main>
  );
}
