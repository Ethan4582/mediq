"use client";

import { useRef, useEffect, useState } from "react";
import { Paperclip, Send } from "lucide-react";

export default function ChatInput({
  onSend,
  onUpload,
  disabled,
}: {
  onSend: (text: string) => void;
  onUpload?: (file: File) => void;
  disabled?: boolean;
}) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      className="px-4 pb-4 shrink-0"
      style={{ background: "var(--bg-primary)" }}
    >
      <div
        className={`flex items-end gap-3 rounded-2xl border border-[#e5e7eb] bg-white px-4 py-3 shadow-card transition-all focus-within:ring-2 focus-within:ring-[#2563eb]/20 focus-within:border-[#2563eb] ${disabled ? "opacity-50 pointer-events-none" : ""}`}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => {
            if (e.target.files?.[0] && onUpload) {
              onUpload(e.target.files[0]);
            }
            e.target.value = "";
          }}
        />
        <button
          className="transition-colors shrink-0 mb-0.5 hover:text-blue-500"
          style={{ color: "var(--text-muted)" }}
          onClick={() => fileInputRef.current?.click()}
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
      <p className="text-center text-xs py-2 mt-1" style={{ color: "var(--text-muted)" }}>
        MediQ can make mistakes. Please verify important information.
      </p>
    </div>
  );
}
