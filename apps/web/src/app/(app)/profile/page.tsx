import { createClient } from "@/lib/supabase/server";
import ProfileCard from "@/components/profile/ProfileCard";
import PasswordForm from "@/components/profile/PasswordForm";
import DangerZone from "@/components/profile/DangerZone";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isEmailUser = user?.app_metadata?.provider !== "google";

  return (
    <div className="max-w-2xl mx-auto py-10 px-6 space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
        Profile
      </h1>
      {user && <ProfileCard user={user} />}
      {isEmailUser && <PasswordForm />}
      <DangerZone />
    </div>
  );
}
