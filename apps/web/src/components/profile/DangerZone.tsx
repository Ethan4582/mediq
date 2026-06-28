"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export default function DangerZone() {
  const supabase = createClient();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");

  const handleDelete = async () => {
    // Actual delete logic requires server side admin client
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <>
      <div
        className="rounded-xl border p-6 space-y-4"
        style={{ borderColor: "#fecaca", background: "#fef2f2" }}
      >
        <div>
          <h3 className="font-semibold text-base text-red-600">Danger Zone</h3>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
            Once you delete your account, there is no going back.
          </p>
        </div>

        <div className="flex items-center justify-between gap-4 mt-2">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
              <Trash2 size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm text-gray-900">Delete Account</h4>
              <p className="text-xs text-gray-500">
                Permanently delete your account and all your data.
              </p>
            </div>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="shrink-0 border rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-red-50"
            style={{ borderColor: "#fca5a5", color: "#dc2626" }}
          >
            Delete Account
          </button>
        </div>
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
    </>
  );
}
