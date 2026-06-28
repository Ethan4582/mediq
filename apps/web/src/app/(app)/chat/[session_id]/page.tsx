import ChatPanel from "@/components/chat/ChatPanel";

export default async function ChatSessionPage({
  params,
}: {
  params: Promise<{ session_id: string }>;
}) {
  const { session_id } = await params;
  return <ChatPanel sessionId={session_id} />;
}
