"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function DangerZone() {
  const supabase = createClient();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleDelete = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="space-y-4">
      <Button
        variant="outline"
        className="border"
        style={{ borderColor: "var(--border-default)" }}
        onClick={handleSignOut}
      >
        Sign out
      </Button>

      <div className="rounded-xl border border-red-200 p-5 space-y-3">
        <h3 className="font-semibold text-base text-red-700">Danger Zone</h3>
        <p className="text-sm text-red-600">
          Permanently delete your account and all data.
        </p>
        <Button variant="destructive" onClick={() => setOpen(true)}>
          Delete account
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete account</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This action is irreversible. Type <strong>DELETE</strong> to confirm.
          </p>
          <Input
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="DELETE"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={confirm !== "DELETE"}
              onClick={handleDelete}
            >
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
