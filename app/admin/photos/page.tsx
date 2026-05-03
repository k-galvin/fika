import { getUnapprovedPhotos } from "@/app/actions"; // Removed approvePhoto, denyPhoto
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminPhotoActions } from "@/components/admin/admin-photo-actions"; // New import
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function AdminPhotosPage() {
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

  const unapprovedPhotos = await getUnapprovedPhotos();

  return (
    <div className="flex-1 w-full flex flex-col gap-8 md:gap-12 items-center p-8 max-w-4xl mx-auto">
      <div className="w-full flex flex-col gap-4">
        <Link 
          href="/admin" 
          className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-4xl font-bold font-kate">Manage Photos</h1>
      </div>

      {unapprovedPhotos && unapprovedPhotos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {unapprovedPhotos.map((photo) => (
            <Card key={photo.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>Photo for {photo.coffee_shops?.name}</CardTitle>
                <p className="text-sm text-gray-500">
                  Uploaded by {photo.profiles?.username || "Unknown"}
                </p>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-4">
                <div className="relative w-full h-48 rounded-md overflow-hidden bg-muted">
                  <Image
                    src={photo.photo_url}
                    alt={`Photo for ${photo.coffee_shops?.name}`}
                    fill
                    className="object-contain"
                  />
                </div>
                {/* Replaced buttons with AdminPhotoActions component */}
                <AdminPhotoActions
                  photoId={photo.id}
                  photoUrl={photo.photo_url}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <AdminEmptyState 
          message="No photos awaiting approval" 
          description="Everything is up to date! Check back later for new photo submissions."
        />
      )}
    </div>
  );
}
