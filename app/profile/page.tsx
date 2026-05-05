import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Footer } from "@/components/footer";

import { User, Edit3 } from "lucide-react"; // Added History icon
import { getSavedCafes, getVisitedCafes, getCafeCount } from "@/app/actions"; // Import server actions

import { ProfileCafes } from "@/components/profile-cafes";
import ProfileCharts from "@/components/ProfileCharts";
import { FindFriends } from "@/components/find-friends";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  const savedCafes = await getSavedCafes();
  const visitedCafes = await getVisitedCafes();
  const totalCafeCount = await getCafeCount();

  const { data: isAdmin } = await supabase.rpc("is_admin");

  const name = profile?.username || user.email;

  const joinedDate = new Date(user.created_at);
  const joinedFullDate = joinedDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="min-h-screen flex flex-col items-center pt-10 pb-20 relative">
      <div className="flex-1 w-full flex flex-col gap-12 max-w-5xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        {/* Editorial Header */}
        <div className="flex flex-col md:flex-row items-baseline gap-6 border-b border-primary/10 pb-8">
          <h1 className="text-6xl md:text-8xl font-bold font-kate text-primary tracking-tighter">
            {name}
          </h1>
          <div className="flex flex-col">
            <span className="text-primary/40 font-kate text-sm uppercase tracking-[0.3em] ml-1">
              Personal Journal
            </span>
            <p className="mt-1 text-xl font-kate text-primary/60 italic leading-tight">
              A record of moments, metrics, <br />
              and favorite cups.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Account & Friends */}
          <div className="lg:col-span-4 flex flex-col gap-10">
            {/* Admin Access Card */}
            {isAdmin && (
              <Link href="/admin" className="group">
                <div className="flex flex-col p-6 rounded-2xl bg-primary/5 border border-primary/20 shadow-sm transition-all hover:shadow-md hover:bg-primary/10">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-kate font-bold text-xl text-primary flex items-center gap-2">
                      Administrative Tools
                    </h3>
                    <div className="bg-primary/10 p-1.5 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <Edit3 className="size-4 text-primary" />
                    </div>
                  </div>
                  <p className="text-sm text-primary/60 font-kate">Manage suggestions, photos, and updates.</p>
                </div>
              </Link>
            )}

            <div className="flex flex-col p-6 rounded-2xl bg-secondary/30 handwritten-border !border-primary/10 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-primary/5 p-2 rounded-full">
                  <User className="size-5 text-primary/70" />
                </div>
                <h3 className="font-kate font-bold text-xl text-primary">Member Details</h3>
              </div>
              
              <div className="space-y-4 font-kate">
                <div className="flex flex-col border-b border-primary/5 pb-2">
                  <span className="text-[10px] uppercase tracking-widest text-primary/40">Registered Email</span>
                  <span className="text-primary/80 font-bold">{user.email}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest text-primary/40">Fika Member Since</span>
                  <span className="text-primary/80 font-bold">{joinedFullDate}</span>
                </div>
              </div>
            </div>

            <FindFriends />
          </div>

          {/* Right Column: Analytics & Lists */}
          <div className="lg:col-span-8 flex flex-col gap-12">
            <section>
              <h2 className="font-kate font-bold text-3xl text-primary mb-6 flex items-center gap-3">
                <span className="opacity-20 text-5xl">01</span>
                Cafe Analytics
              </h2>
              <ProfileCharts visitedCafes={visitedCafes || []} />
            </section>

            <section>
              <h2 className="font-kate font-bold text-3xl text-primary mb-6 flex items-center gap-3">
                <span className="opacity-20 text-5xl">02</span>
                My Collections
              </h2>
              <ProfileCafes
                savedCafes={savedCafes || []}
                visitedCafes={visitedCafes || []}
                totalCafeCount={totalCafeCount}
              />
            </section>
          </div>
        </div>
      </div>
      <Footer user={user} />
    </main>
  );
}
