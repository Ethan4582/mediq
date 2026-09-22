import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/layout/AppShell";
import { redirect } from "next/navigation";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  if (!user) {
    redirect("/auth");
  }

  return <AppShell user={user}>{children}</AppShell>;
}
