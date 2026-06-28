"use client"
import { useState } from "react";
import { UploadCloud } from "lucide-react";

export default function UploadDropzone({ onUpload }: { onUpload: (file: File) => void }) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  return (
    <div
      className={`relative w-full max-w-xl mx-auto p-10 border-2 border-dashed rounded-xl transition-colors ${dragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/30 bg-muted/20'}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept=".pdf, .png, .jpg, .jpeg"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleChange}
      />
      <div className="flex flex-col items-center justify-center space-y-4 text-center pointer-events-none">
        <UploadCloud size={48} className="text-muted-foreground" />
        <div className="space-y-1">
          <p className="font-semibold text-lg">Click or drag and drop to upload</p>
          <p className="text-sm text-muted-foreground">PDF, JPG, or PNG</p>
        </div>
      </div>
    </div>
  )
}
