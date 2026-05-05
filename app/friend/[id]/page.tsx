import { createClient } from "@/lib/supabase/server";
import { Footer } from "@/components/footer";
import { getSavedCafes, getVisitedCafes, getCafeCount } from "@/app/actions";
import { ProfileCafes } from "@/components/profile-cafes";
import ProfileCharts from "@/components/ProfileCharts";

export default async function FriendProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const supabase = await createClient();
  const { id } = resolvedParams; // friend’s user ID from the URL

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  const savedCafes = await getSavedCafes(id);
  const visitedCafes = await getVisitedCafes(id);
  const totalCafeCount = await getCafeCount();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("username, id")
    .eq("id", id)
    .single();

  if (profileError || !profile) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-gray-500">Profile not found.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center pt-10 pb-20 relative bg-background">
      <div className="flex-1 w-full flex flex-col gap-12 max-w-5xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        {/* Editorial Header */}
        <div className="flex flex-col md:flex-row items-baseline gap-6 border-b border-primary/10 pb-8">
          <h1 className="text-6xl md:text-8xl font-bold font-kate text-primary tracking-tighter">
            {profile.username}
          </h1>
          <div className="flex flex-col">
            <span className="text-primary/40 font-kate text-sm uppercase tracking-[0.3em] ml-1">
              Friend Journal
            </span>
            <p className="mt-1 text-xl font-kate text-primary/60 italic leading-tight">
              A shared record of moments, <br />
              metrics, and favorite cups.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Column 1: Analytics */}
          <section className="flex flex-col gap-8">
            <h2 className="font-kate font-bold text-3xl text-primary mb-2 flex items-center gap-3">
              <span className="opacity-20 text-5xl">01</span>
              Cafe Analytics
            </h2>
            <ProfileCharts 
              visitedCafes={visitedCafes || []} 
              subtitle={`A glimpse into their cafe habits and preferences.`}
            />
          </section>

          {/* Column 2: The Collection */}
          <section className="flex flex-col gap-8">
            <h2 className="font-kate font-bold text-3xl text-primary mb-2 flex items-center gap-3">
              <span className="opacity-20 text-5xl">02</span>
              The Collection
            </h2>
            <ProfileCafes
              savedCafes={savedCafes || []}
              visitedCafes={visitedCafes || []}
              totalCafeCount={totalCafeCount}
              friendView
            />
          </section>
        </div>
      </div>
      <Footer user={currentUser} />
    </main>
  );
}
