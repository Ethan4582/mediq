import type { Message } from "@/types/app";
import { format } from "date-fns";

export default function MessageBubble({ message }: { message: Message }) {
  const time = message.created_at
    ? format(new Date(message.created_at), "hh:mm a")
    : "";

  return (
    <div className="flex justify-end w-full max-w-[860px] mx-auto py-1">
      <div className="flex flex-col items-end max-w-[72%]">
        <div className="bg-[#e8edf5] text-[#111827] rounded-2xl rounded-tr-sm px-4 py-2.5 text-[15px] leading-relaxed">
          {message.content}
        </div>
        <span className="text-[11px] font-medium text-gray-400 mt-1 mr-1">{time}</span>
      </div>
    </div>
  );
}
