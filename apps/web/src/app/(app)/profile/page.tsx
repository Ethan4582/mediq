import { createClient } from "@/lib/supabase/server";
import AccountCard from "@/components/profile/AccountCard";
import DisplayNameCard from "@/components/profile/DisplayNameCard";
import PasswordForm from "@/components/profile/PasswordForm";
import DangerZone from "@/components/profile/DangerZone";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isEmailUser = user?.app_metadata?.provider !== "google";

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: "var(--bg-primary)" }}>
      <div className="max-w-[700px] mx-auto w-full py-10 px-6 space-y-6 flex-1">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Profile
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Manage your account information and preferences.
          </p>
        </div>

        {user && (
          <>
            <AccountCard user={user} />
            <DisplayNameCard user={user} />
          </>
        )}
        {isEmailUser && <PasswordForm />}
        <DangerZone />
      </div>

      <p className="text-center text-xs py-6 mt-auto" style={{ color: "var(--text-muted)" }}>
        MediQ can make mistakes. Please verify important information.
      </p>
    </div>
  );
}
