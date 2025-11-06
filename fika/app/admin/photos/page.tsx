import { getUnapprovedPhotos } from "@/app/actions"; // Removed approvePhoto, denyPhoto
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminPhotoActions } from "@/components/admin/admin-photo-actions"; // New import

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
      <h1 className="text-4xl font-bold font-kate">Manage Photos</h1>

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
                <div className="relative w-full h-48 rounded-md overflow-hidden">
                  <Image
                    src={photo.photo_url}
                    alt={`Photo for ${photo.coffee_shops?.name}`}
                    fill
                    className="object-cover"
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
        <p className="text-center text-gray-500">
          No photos awaiting approval.
        </p>
      )}
    </div>
  );
}
