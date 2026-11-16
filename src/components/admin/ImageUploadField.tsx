"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, Link as LinkIcon, X, Loader2, ImageIcon, Check } from "lucide-react";

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  helpText?: string;
  required?: boolean;
}

export default function ImageUploadField({
  label,
  value,
  onChange,
  placeholder = "e.g. /hero_child_therapy.jpg or https://...",
  helpText,
  required = false,
}: ImageUploadFieldProps) {
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
    <div className="space-y-2.5 text-xs">
      {/* Field Label */}
      <div className="flex items-center justify-between">
        <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {value && (
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            ✓ Image Linked
          </span>
        )}
      </div>

      {/* Main Upload Box */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
        {/* Thumbnail Preview */}
        <div className="sm:col-span-4 relative aspect-16/10 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 group">
          {value ? (
            <>
              <img
                src={value}
                alt={label}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/about_center_photo.jpg";
                }}
              />
              <button
                type="button"
                onClick={() => onChange("")}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-950/70 text-white hover:bg-rose-600 transition-colors opacity-0 group-hover:opacity-100"
                title="Remove image"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-1 p-2">
              <ImageIcon className="w-6 h-6 stroke-1 text-slate-300" />
              <span className="text-[10px] font-bold uppercase tracking-wider">No Photo</span>
            </div>
          )}
        </div>

        {/* Dual Mode: Option 1 (Upload File) + Option 2 (Direct URL Input) */}
        <div className="sm:col-span-8 space-y-2.5">
          {/* Option 1: File Upload Box */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-2xl p-3.5 transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
              isDragging
                ? "border-blue-500 bg-blue-50/50"
                : "border-slate-200 bg-slate-50/80 hover:bg-white hover:border-blue-300"
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFileChange}
            />

            {isUploading ? (
              <div className="flex flex-col items-center gap-1.5 py-1">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                <span className="text-[11px] font-bold text-slate-600">
                  Uploading file from system...
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1 py-0.5">
                <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-black text-blue-600 hover:text-blue-700">
                    Click to choose file from computer
                  </span>
                  <p className="text-[10px] text-slate-400 font-medium">
                    or drag & drop here (JPG, PNG, WEBP, SVG)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Divider with text */}
          <div className="flex items-center gap-2">
            <div className="flex-1 border-t border-slate-200" />
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 bg-white px-1">
              OR ENTER IMAGE URL / PATH
            </span>
            <div className="flex-1 border-t border-slate-200" />
          </div>

          {/* Option 2: Direct URL / Path input (ALWAYS VISIBLE) */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <LinkIcon className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl font-mono text-[11px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          {uploadError && (
            <p className="text-[11px] font-bold text-rose-600 animate-in fade-in">
              {uploadError}
            </p>
          )}

          {helpText && (
            <p className="text-[10px] text-slate-400 font-medium">
              {helpText}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
