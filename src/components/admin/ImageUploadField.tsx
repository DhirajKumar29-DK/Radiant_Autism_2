"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import {
  UploadCloud,
  Link as LinkIcon,
  X,
  Loader2,
  ImageIcon,
  CheckCircle2,
  Trash2,
} from "lucide-react";

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  helpText?: string;
  recommendedSize?: string;
  required?: boolean;
}

export default function ImageUploadField({
  label,
  value,
  onChange,
  placeholder = "https://images.unsplash.com/... or paste direct web image link",
  helpText,
  recommendedSize,
  required = false,
}: ImageUploadFieldProps) {
  // Mode switcher: "upload" or "url"
  // Default to "url" if value looks like a full URL, otherwise "upload"
  const [mode, setMode] = useState<"upload" | "url">("upload");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Please select a valid image file (PNG, JPG, WEBP, SVG, etc.)");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success && data.url) {
        onChange(data.url);
      } else {
        setUploadError(data.error || "Failed to upload image from system.");
      }
    } catch (err: unknown) {
      console.error("Upload error:", err);
      setUploadError("Network error while uploading image.");
    } finally {
      setIsUploading(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  return (
    <div className="space-y-2 text-xs">
      {/* Top Header Bar with Label & Tab Switcher (Upload File vs Image URL) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <label className="font-extrabold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-rose-500 shrink-0" />
          <span>
            {label} {required && <span className="text-rose-500">*</span>}
          </span>
        </label>

        {/* Pill Segmented Switcher */}
        <div className="inline-flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/70 shrink-0">
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              mode === "upload"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload File</span>
          </button>

          <button
            type="button"
            onClick={() => setMode("url")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              mode === "url"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Image URL</span>
          </button>
        </div>
      </div>

      {/* Input or Upload Area Based on Selected Mode */}
      {mode === "url" ? (
        <div className="space-y-2">
          <div className="relative">
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full p-3 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-2xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-xs"
            />
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-600 transition-colors p-1"
                title="Clear URL"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {/* File Upload Dropzone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-4 transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
              isDragging
                ? "border-blue-500 bg-blue-50/50"
                : "border-slate-200 bg-slate-50/80 hover:bg-white hover:border-blue-300"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFileChange}
            />

            {isUploading ? (
              <div className="flex flex-col items-center gap-1.5 py-2">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                <span className="text-xs font-bold text-slate-700">
                  Uploading image from computer...
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-3 py-1">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-black text-blue-600 hover:text-blue-700">
                    Click to choose image file from computer
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    or drag & drop file here (JPG, PNG, WEBP, SVG)
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upload Error Banner */}
      {uploadError && (
        <p className="text-[11px] font-bold text-rose-600 animate-in fade-in">
          {uploadError}
        </p>
      )}

      {/* Linked Image Preview Bar (If image exists) */}
      {value && (
        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-200/90 gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative shrink-0">
              <img
                src={value}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/about_center_photo.jpg";
                }}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="text-[11px] font-extrabold text-slate-800">
                  Image Ready
                </span>
              </div>
              <p className="text-[10px] font-mono text-slate-500 truncate max-w-xs sm:max-w-md">
                {value}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onChange("")}
            className="p-1.5 rounded-xl bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 transition-colors shrink-0"
            title="Remove image"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {(helpText || recommendedSize) && (
        <p className="text-[10px] text-slate-400 font-medium">
          {helpText || (recommendedSize ? `Recommended: ${recommendedSize}` : null)}
        </p>
      )}
    </div>
  );
}
