"use client";

import { useState } from "react";
import SettingsShell from "@/components/layout/SettingsShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sliders, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [conciseMode, setConciseMode] = useState(false);
  const [telemetry, setTelemetry] = useState(false);
  const [notifyOnComplete, setNotifyOnComplete] = useState(true);

  const handleSave = () => {
    toast.success("Preferences saved successfully");
  };

  return (
    <SettingsShell
      title="Preferences"
      description="Customize your clinical reasoning environment, notification preferences, and privacy."
    >
      <Card className="border border-border/80 shadow-xs rounded-2xl bg-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sliders className="size-4 text-primary" />
            <CardTitle className="text-base font-semibold">Clinical Agent Behavior</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Configure how the agent structures discharge summaries and extraction.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-border/40">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-foreground">Concise Summary Mode</span>
              <p className="text-xs text-muted-foreground">
                Generate tighter, high-yield bulleted summaries instead of full clinical narratives.
              </p>
            </div>
            <Button
              variant={conciseMode ? "default" : "outline"}
              size="sm"
              onClick={() => setConciseMode(!conciseMode)}
              className="h-8 px-3 text-xs rounded-xl"
            >
              {conciseMode ? "Enabled" : "Disabled"}
            </Button>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-foreground">Processing Notifications</span>
              <p className="text-xs text-muted-foreground">
                Play subtle audio tone and display toast when background OCR and extraction finish.
              </p>
            </div>
            <Button
              variant={notifyOnComplete ? "default" : "outline"}
              size="sm"
              onClick={() => setNotifyOnComplete(!notifyOnComplete)}
              className="h-8 px-3 text-xs rounded-xl"
            >
              {notifyOnComplete ? "Enabled" : "Disabled"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border/80 shadow-xs rounded-2xl bg-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-emerald-600" />
            <CardTitle className="text-base font-semibold">Privacy & Telemetry</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Manage clinical data retention and local privacy settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-foreground">Zero-Retention Diagnostic Logs</span>
              <p className="text-xs text-muted-foreground">
                Do not store transient reasoning tokens in local debug caches.
              </p>
            </div>
            <Button
              variant={telemetry ? "default" : "outline"}
              size="sm"
              onClick={() => setTelemetry(!telemetry)}
              className="h-8 px-3 text-xs rounded-xl"
            >
              {telemetry ? "Active" : "Standard"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-2">
        <Button onClick={handleSave} className="h-9 px-5 text-xs font-semibold rounded-xl">
          Save Preferences
        </Button>
      </div>
    </SettingsShell>
  );
}
