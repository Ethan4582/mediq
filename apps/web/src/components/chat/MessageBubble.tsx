import { MessageRole } from "@/types/app";

export default function MessageBubble({ role, content }: { role: MessageRole; content: string }) {
  const isUser = role === "user";

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} my-4`}>
      <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${isUser ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted text-foreground rounded-bl-none'}`}>
        <p className="whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  )
}
