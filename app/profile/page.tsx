import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Footer } from "@/components/footer";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { User } from "lucide-react"; // Added History icon
import { getSavedCafes, getVisitedCafes } from "@/app/actions"; // Import server actions

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

  const name = profile?.username || user.email;

  const joinedDate = new Date(user.created_at);
  const joinedFullDate = joinedDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="min-h-screen flex flex-col items-center pt-12 relative">
      <div className="flex-1 w-full flex flex-col gap-10 max-w-4xl p-5">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-kate">
            {name}&apos;s Profile
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Welcome to your personal fika space.
          </p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Account Information
              </CardTitle>
              <CardDescription>
                View and manage your account details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium">Email:</span>
                <span className="text-gray-700">{user.email}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium">Account Created:</span>
                <span className="text-gray-700">{joinedFullDate}</span>
              </div>
            </CardContent>
          </Card>

          <FindFriends />

          <ProfileCharts visitedCafes={visitedCafes || []} />

          <ProfileCafes
            savedCafes={savedCafes || []}
            visitedCafes={visitedCafes || []}
          />
        </div>
      </div>
      <Footer user={user} />
    </main>
  );
}
