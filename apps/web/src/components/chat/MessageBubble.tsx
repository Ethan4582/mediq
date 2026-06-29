import type { Message } from "@/types/app";
import { format } from "date-fns";

export default function MessageBubble({ message }: { message: Message }) {
  const time = message.created_at
    ? format(new Date(message.created_at), "hh:mm a")
    : "";

  return (
    <div className="flex justify-end gap-2 items-end">
      <div className="flex flex-col items-end">
        <span className="text-xs text-[#9ca3af] mb-1.5 mr-1">{time}</span>
        <div className="bg-[#eff6ff] text-[#1e40af] rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[420px] text-sm leading-relaxed">
          {message.content}
        </div>
      </div>
      <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 mb-0.5 bg-gray-200">
        <img src="/default_avatar.jpg" alt="User" className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
      </div>
    </div>
  );
}
