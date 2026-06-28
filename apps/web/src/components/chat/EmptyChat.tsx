export default function EmptyChat() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden border"
        style={{ background: "#ffffff", borderColor: "var(--border-default)" }}
      >
        <img src="/logo.png" alt="MediQ" className="w-10 h-10 object-contain" />
      </div>
      <div className="text-center space-y-2">
        <h3 className="font-semibold text-xl" style={{ color: "var(--text-primary)" }}>
          How can MediQ help today?
        </h3>
        <p className="text-sm max-w-sm mx-auto" style={{ color: "var(--text-secondary)" }}>
          Upload a patient document using the paperclip icon below to generate a discharge summary.
        </p>
      </div>
    </div>
  );
}
