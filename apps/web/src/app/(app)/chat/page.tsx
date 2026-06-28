import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ChatIndexPage() {
  return (
    <div className="flex h-full w-full items-center justify-center p-4">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">No case selected</h2>
        <p className="text-muted-foreground">
          Select a case from the sidebar or upload a new document to get started.
        </p>
        <Link href="/">
          <Button variant="default" className="mt-2">
            Upload documents
          </Button>
        </Link>
      </div>
    </div>
  );
}
