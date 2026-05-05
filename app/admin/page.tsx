import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Coffee, Camera, Edit3, ChevronRight, Star } from "lucide-react";
import { getSuggestedCafes, getUnapprovedPhotos, getCafeUpdates, getFeaturedCafes } from "@/app/actions";
import { Badge } from "@/components/ui/badge";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: isAdminData } = await supabase.rpc("is_admin");

  if (!isAdminData) {
    redirect("/");
  }

  // Fetch counts for badges
  const [suggestions, photos, updates, featured] = await Promise.all([
    getSuggestedCafes(),
    getUnapprovedPhotos(),
    getCafeUpdates(),
    getFeaturedCafes(),
  ]);

  const counts = {
    suggestions: suggestions?.length || 0,
    photos: photos?.length || 0,
    updates: updates?.length || 0,
    featured: featured?.length || 0,
  };

  const adminModules = [
    {
      title: "Suggestions",
      description: "Review and approve new cafe submissions from the community.",
      href: "/admin/suggestions",
      icon: Coffee,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/10",
      count: counts.suggestions,
    },
    {
      title: "Photos",
      description: "Moderate uploaded photos to ensure they meet quality standards.",
      href: "/admin/photos",
      icon: Camera,
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-900/10",
      count: counts.photos,
    },
    {
      title: "Updates",
      description: "Manage suggested changes to existing cafe details and features.",
      href: "/admin/updates",
      icon: Edit3,
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-900/10",
      count: counts.updates,
    },
    {
      title: "Featured",
      description: "Select the three cafes highlighted as favorites on the home page.",
      href: "/admin/featured",
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/10",
      count: counts.featured,
    },
  ];

  return (
    <div className="flex-1 w-full flex flex-col gap-8 md:gap-12 items-center p-8 max-w-5xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-4xl md:text-5xl font-bold font-kate">Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome back. What would you like to manage today?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full mt-4">
        {adminModules.map((module) => (
          <Link key={module.href} href={module.href} className="group relative">
            <Card className="h-full transition-all hover:shadow-md hover:border-primary/20 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <div className={`${module.bgColor} ${module.color} w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <module.icon className="w-6 h-6" />
                  </div>
                  {module.count > 0 && (
                    <Badge variant="destructive" className="font-kate animate-pulse">
                      {module.count}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-2xl font-kate flex items-center justify-between">
                  {module.title}
                  <ChevronRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  {module.description}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
