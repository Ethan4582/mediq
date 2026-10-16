"use client";

import { useState } from "react";
import { Plus, Key, Trash2, AlertTriangle } from "lucide-react";
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
import type { LLMProvider, KeyType } from "@/types/app";

export default function KeyTableClient() {
  const [open, setOpen] = useState(false);
  const [dialogKeyType, setDialogKeyType] = useState<KeyType>("ocr");
  const { keys, has_mistral_key, has_llm_key, loading, refetch } = useKeyStatus();

  const handleOpenDialog = (type: KeyType) => {
    setDialogKeyType(type);
    setOpen(true);
  };

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
    <Card className="overflow-hidden shadow-sm border border-border/80">
      <CardHeader className="flex flex-row items-center justify-between px-6 py-4 border-b">
        <div>
          <CardTitle className="text-base font-semibold">Configured API Keys</CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your Layer 1 Mistral OCR and Layer 2 Clinical Reasoning LLM credentials.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => handleOpenDialog("ocr")}
            variant="outline"
            className="gap-1.5 text-xs h-8 rounded-xl"
          >
            <Plus className="size-3.5" />
            <span>Add OCR Key</span>
          </Button>
          <Button
            size="sm"
            onClick={() => handleOpenDialog("llm")}
            className="gap-1.5 text-xs h-8 rounded-xl shadow-sm"
          >
            <Plus className="size-3.5" />
            <span>Add LLM Key</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {(!has_mistral_key || !has_llm_key) && !loading && (
          <div className="px-6 py-3 bg-amber-500/10 border-b border-amber-500/20 flex items-center gap-2.5 text-xs text-amber-700 dark:text-amber-400">
            <AlertTriangle className="size-4 shrink-0" />
            <span>
              Two-Layer setup incomplete: You must configure both a <strong>Layer 1 Mistral OCR key</strong> and a <strong>Layer 2 LLM key</strong> for full document synthesis.
            </span>
          </div>
        )}

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
              Connect at least two keys: one for Layer 1 Mistral OCR and one for your preferred Layer 2 LLM provider.
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => handleOpenDialog("ocr")} className="gap-1.5 text-xs rounded-xl">
                <Plus className="size-3.5" /> Add Mistral OCR Key
              </Button>
              <Button size="sm" onClick={() => handleOpenDialog("llm")} className="gap-1.5 text-xs rounded-xl">
                <Plus className="size-3.5" /> Add LLM Key
              </Button>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 text-xs">
                <TableHead>Provider</TableHead>
                <TableHead>Architecture Layer</TableHead>
                <TableHead>Key Fragment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Added</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keys.map((k) => (
                <TableRow key={k.id} className="text-xs">
                  <TableCell className="font-medium flex items-center gap-2">
                    <div className="size-4 shrink-0 flex items-center justify-center overflow-hidden">
                      <Image
                        src={`/${k.provider.toLowerCase()}.svg`}
                        width={16}
                        height={16}
                        alt={k.provider}
                        className="w-4 h-4 object-contain"
                        onError={(e) => (e.currentTarget.style.display = "none")}
                      />
                    </div>
                    <span>{PROVIDERS[k.provider as LLMProvider]?.name || k.provider}</span>
                  </TableCell>
                  <TableCell>
                    {k.key_type === "ocr" ? (
                      <Badge variant="outline" className="text-[10px] bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20">
                        Layer 1: Document OCR
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">
                        Layer 2: Reasoning LLM
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-muted-foreground">···· {k.key_last4}</TableCell>
                  <TableCell>
                    {k.key_type === "ocr" ? (
                      k.is_active ? (
                        <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          Active OCR
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-muted-foreground">
                          Inactive
                        </Badge>
                      )
                    ) : (
                      k.is_active ? (
                        <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          Active LLM
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-muted-foreground">
                          Standby
                        </Badge>
                      )
                    )}
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
                          className="h-7 px-2.5 text-[11px] rounded-lg"
                        >
                          {k.is_active ? "Active" : "Set Active"}
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteKey(k.id)}
                        className="size-7 text-muted-foreground hover:text-destructive rounded-lg"
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

      <AddKeyDialog
        open={open}
        onOpenChange={setOpen}
        defaultKeyType={dialogKeyType}
        onSaved={refetch}
      />
    </Card>
  );
}
