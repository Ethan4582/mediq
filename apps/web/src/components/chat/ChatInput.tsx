"use client";

import { useRef, useEffect, useState } from "react";
import { Paperclip, Send } from "lucide-react";

export default function ChatInput({
  onSend,
  disabled,
}: {
  onSend: (text: string) => void;
  disabled?: boolean;
}) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  const handleSend = () => {
    if (text.trim() && !disabled) {
      onSend(text.trim());
      setText("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className="border-t px-4 py-3 shrink-0"
      style={{ borderColor: "var(--border-default)", background: "var(--bg-primary)" }}
    >
      <div
        className={`flex items-end gap-3 rounded-xl border px-4 py-3 transition-all ${disabled ? "opacity-50 pointer-events-none" : ""}`}
        style={{
          borderColor: "var(--border-default)",
          background: "var(--bg-primary)",
        }}
      >
        <button
          className="transition-colors shrink-0 mb-0.5"
          style={{ color: "var(--text-muted)" }}
        >
          <Paperclip size={18} />
        </button>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={disabled ? "Processing documents…" : "Ask about this case…"}
          className="flex-1 resize-none outline-none text-sm bg-transparent min-h-[22px] max-h-[120px]"
          style={{ color: "var(--text-primary)" }}
          rows={1}
        />

        <button
          onClick={handleSend}
          disabled={disabled || !text.trim()}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0 transition-colors disabled:opacity-40"
          style={{ background: "var(--brand-primary)" }}
        >
          <Send size={15} />
        </button>
      </div>
      <p className="text-center text-xs py-2" style={{ color: "var(--text-muted)" }}>
        MediQ can make mistakes. Please verify medical information.
      </p>
    </div>
  );
}
