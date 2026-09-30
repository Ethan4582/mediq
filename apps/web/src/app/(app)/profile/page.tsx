import { createClient } from "@/lib/supabase/server";
import SettingsShell from "@/components/layout/SettingsShell";
import AccountCard from "@/components/profile/AccountCard";
import DisplayNameCard from "@/components/profile/DisplayNameCard";
import PasswordForm from "@/components/profile/PasswordForm";
import DangerZone from "@/components/profile/DangerZone";

export default async function ProfilePage() {
  let user = null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    if (!error) {
      user = data.user;
    }
  } catch {
    user = null;
  }

  const isEmailUser = user?.app_metadata?.provider !== "google";

  return (
    <SettingsShell
      title="Profile"
      description="Manage your personal profile, display credentials, and session preferences."
    >
      {user && (
        <>
          <AccountCard user={user} />
          <DisplayNameCard user={user} />
        </>
      )}
      {isEmailUser && <PasswordForm />}
      <DangerZone />
    </SettingsShell>
  );
}
