"use client";

import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  message?: string;
  itemCount?: number;
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmText?: string;
  cancelText?: string;
  isDeleting?: boolean;
  variant?: "danger" | "warning" | "info" | string;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Deletion",
  message = "Are you sure you want to delete this record? This action cannot be undone.",
  itemCount = 1,
  confirmButtonText,
  cancelButtonText,
  confirmText,
  cancelText,
  isDeleting = false,
  variant = "danger",
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const resolvedConfirmText = confirmText || confirmButtonText || "Delete";
  const resolvedCancelText = cancelText || cancelButtonText || "Cancel";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1 pt-1 space-y-1">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">{title}</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                {itemCount > 1
                  ? `Are you sure you want to delete these ${itemCount} selected items? This action cannot be undone.`
                  : message}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200/70 bg-white border border-slate-200 rounded-xl transition-colors"
          >
            {resolvedCancelText}
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={() => {
              onConfirm();
            }}
            className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-colors shadow-sm disabled:opacity-50"
          >
            {itemCount > 1 ? `Delete Selected (${itemCount})` : resolvedConfirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
