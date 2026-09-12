"use client";

import Link from "next/link";
import { format, parseISO } from "date-fns";
import { ExternalLink } from "lucide-react";
import Image from "next/image";
import type { RecentSession } from "@/types/app";
import StatusBadge from "@/components/shared/StatusBadge";
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
import { Button } from "@/components/ui/button";

export default function RecentSessionsTable({
  data,
  loading,
}: {
  data: RecentSession[];
  loading: boolean;
}) {
  return (
    <Card className="shadow-sm overflow-hidden">
      <CardHeader className="px-6 py-4 border-b">
        <CardTitle className="text-base font-semibold">Recent Sessions</CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        {loading ? (
          <div className="p-6 space-y-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="py-16 text-center text-xs text-muted-foreground">
            No sessions recorded yet. Start a new session to see analytics.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 text-xs">
                <TableHead>Case / Session</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Pages</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((s) => (
                <TableRow key={s.session_id} className="text-xs">
                  <TableCell className="font-medium max-w-[200px] truncate">
                    {(s.title || `Case #${s.session_id.slice(0, 6)}`).slice(0, 35)}
                  </TableCell>
                  <TableCell className="text-muted-foreground whitespace-nowrap">
                    {format(parseISO(s.created_at), "MMM d, yyyy HH:mm")}
                  </TableCell>
                  <TableCell className="font-medium">{s.page_count}</TableCell>
                  <TableCell>
                    {s.provider_used ? (
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-muted text-[11px] font-medium capitalize">
                        <Image
                          src={`/${s.provider_used.toLowerCase()}.svg`}
                          alt={s.provider_used}
                          width={14}
                          height={14}
                          className="object-contain"
                          onError={(e) => (e.currentTarget.style.display = "none")}
                        />
                        <span>{s.provider_used}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={s.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild size="sm" variant="ghost" className="h-7 text-xs gap-1">
                      <Link href={`/chat/${s.session_id}`}>
                        <span>Open</span>
                        <ExternalLink className="size-3" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
