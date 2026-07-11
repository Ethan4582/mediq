import { Copy, Download, Share, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function MessageActions({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownloadPdf = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>MediQ AI Summary</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; padding: 40px; color: #111827; max-width: 800px; margin: 0 auto; }
            pre { white-space: pre-wrap; font-family: inherit; margin-top: 20px; }
            h2 { color: #2563eb; }
          </style>
        </head>
        <body>
          <h2>MediQ AI Summary</h2>
          <hr />
          <pre>${content}</pre>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <div className="flex gap-1 mt-2">
      <button
        onClick={handleCopy}
        title="Copy"
        className="w-7 h-7 rounded-md flex items-center justify-center transition-colors hover:bg-[#f4f6f8] text-[#9ca3af] hover:text-[#374151]"
      >
        <Copy size={14} />
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            title="More options"
            className="w-7 h-7 rounded-md flex items-center justify-center transition-colors hover:bg-[#f4f6f8] text-[#9ca3af] hover:text-[#374151]"
          >
            <MoreHorizontal size={14} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuItem onClick={handleDownloadPdf}>
            <Download className="mr-2 h-4 w-4" />
            <span>Download PDF</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Share className="mr-2 h-4 w-4" />
            <span>Share</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
