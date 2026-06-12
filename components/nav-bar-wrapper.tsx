import { NavBar } from "./nav-bar";
import { AuthButton } from "./auth-button";
import { getUser, getProfile } from "@/lib/supabase/server";

export async function NavBarWrapper() {
  const { user } = await getUser();
  const { profile } = user ? await getProfile(user.id) : { profile: null };

  return (
    <NavBar
      user={user}
      profile={profile}
      authButton={
        <AuthButton
          key={user?.id || "logged-out"}
          initialUser={user}
          initialProfile={profile}
        />
      }
    />
  );
}
