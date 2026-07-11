import type { Message } from "@/types/app";
import { format } from "date-fns";

export default function MessageBubble({ message }: { message: Message }) {
  const time = message.created_at
    ? format(new Date(message.created_at), "hh:mm a")
    : "";

  return (
    <div className="flex justify-end w-full max-w-[780px] mx-auto py-2">
      <div className="flex flex-col items-end max-w-[80%]">
        <div className="bg-[#f3f4f6] text-[#111827] rounded-3xl rounded-tr-md px-5 py-3 text-[15px] leading-relaxed shadow-sm">
          {message.content}
        </div>
        <span className="text-[11px] font-medium text-gray-400 mt-1.5 mr-1">{time}</span>
      </div>
    </div>
  );
}
