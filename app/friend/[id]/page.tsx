import { createClient } from "@/lib/supabase/server";
import { Footer } from "@/components/footer";
import { getSavedCafes, getVisitedCafes } from "@/app/actions";
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
    <main className="min-h-screen flex flex-col items-center pt-12 relative">
      <div className="flex-1 w-full flex flex-col gap-10 max-w-4xl p-5">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-kate">
            {profile.username}&apos;s Profile
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            A taste of their fika journey.
          </p>
        </div>
        <div className="space-y-8">
          <ProfileCharts
            visitedCafes={visitedCafes || []}
            subtitle={`A glimpse into their cafe preferences.`}
          />
          <ProfileCafes
            savedCafes={savedCafes || []}
            visitedCafes={visitedCafes || []}
            friendView
          />
        </div>
      </div>
      <Footer user={currentUser} />
    </main>
  );
}
