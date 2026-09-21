"use client";

import { useState } from "react";
import { Plus, Key, Trash2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import AddKeyDialog from "./AddKeyDialog";
import { useKeyStatus } from "@/hooks/useKeyStatus";
import { createClient } from "@/lib/supabase/client";
import { API_URL, PROVIDERS } from "@/lib/constants";
import type { LLMProvider } from "@/types/app";

export default function KeyTableClient() {
  const [open, setOpen] = useState(false);
  const { keys, loading, refetch } = useKeyStatus();

  const deleteKey = async (id: string) => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    await fetch(`${API_URL}/api/keys/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
    refetch();
  };

  const activateKey = async (id: string) => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    await fetch(`${API_URL}/api/keys/${id}/activate`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
    refetch();
  };

  return (
    <Card className="overflow-hidden shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between px-6 py-4 border-b">
        <CardTitle className="text-base font-semibold">Configured API Keys</CardTitle>
        <Button size="sm" onClick={() => setOpen(true)} className="gap-1.5 text-xs shadow-sm">
          <Plus className="size-3.5" />
          <span>Add Key</span>
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        {loading ? (
          <div className="p-6 space-y-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : keys.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="size-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground mb-4">
              <Key className="size-5" />
            </div>
            <h3 className="text-sm font-semibold mb-1">No API keys added</h3>
            <p className="text-xs text-muted-foreground mb-4 max-w-sm">
              Connect your Mistral OCR and LLM keys to enable AI discharge summary extraction.
            </p>
            <Button size="sm" variant="outline" onClick={() => setOpen(true)} className="gap-1.5 text-xs">
              <Plus className="size-3.5" /> Add your first key
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 text-xs">
                <TableHead>Provider</TableHead>
                <TableHead>Key Fragment</TableHead>
                <TableHead>Capability</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keys.map((k) => (
                <TableRow key={k.id} className="text-xs">
                  <TableCell className="font-medium flex items-center gap-2">
                    <Image
                      src={`/${k.provider.toLowerCase()}.svg`}
                      width={16}
                      height={16}
                      alt={k.provider}
                      className="object-contain"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                    <span>{PROVIDERS[k.provider as LLMProvider]?.name || k.provider}</span>
                  </TableCell>
                  <TableCell className="font-mono text-muted-foreground">···· {k.key_last4}</TableCell>
                  <TableCell>
                    <Badge variant={k.key_type === "ocr" ? "secondary" : "outline"} className="text-[10px]">
                      {k.key_type === "ocr" ? "OCR Extraction" : "LLM Reasoning"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(k.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {k.key_type === "llm" && (
                        <Button
                          size="sm"
                          variant={k.is_active ? "secondary" : "outline"}
                          onClick={() => !k.is_active && activateKey(k.id)}
                          disabled={k.is_active}
                          className="h-7 px-2.5 text-[11px]"
                        >
                          {k.is_active ? "Active" : "Set Active"}
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteKey(k.id)}
                        className="size-7 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <AddKeyDialog open={open} onOpenChange={setOpen} onSaved={refetch} />
    </Card>
  );
}
