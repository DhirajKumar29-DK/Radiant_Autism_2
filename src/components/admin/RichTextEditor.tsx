"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Link as LinkIcon,
  Unlink,
  Quote,
  Minus,
  Undo,
  Redo,
  RemoveFormatting,
  X,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

const FONT_SIZES = [
  { label: "Font Size", value: "" },
  { label: "Small (13px)", value: "2" },
  { label: "Normal (15px)", value: "3" },
  { label: "Medium (17px)", value: "4" },
  { label: "Large (20px)", value: "5" },
  { label: "Extra Large (24px)", value: "6" },
];

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write clinical article content here...",
  minHeight = "240px",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [openInNewTab, setOpenInNewTab] = useState(true);

  // Sync external value when editor is NOT actively focused
  useEffect(() => {
    if (editorRef.current) {
      const isFocused = document.activeElement === editorRef.current;
      if (!isFocused && editorRef.current.innerHTML !== (value || "")) {
        editorRef.current.innerHTML = value || "";
      }
    }
  }, [value]);

  const exec = (command: string, val: string | undefined = undefined) => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(command, false, val);
    handleInput();
  };

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      onChange(html);
    }
  };

  const handleInsertLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrl) return;

    if (editorRef.current) {
      editorRef.current.focus();
    }

    if (linkText) {
      const targetAttr = openInNewTab ? ' target="_blank" rel="noopener noreferrer"' : "";
      const anchorHtml = `<a href="${linkUrl}"${targetAttr} class="text-blue-600 underline font-semibold">${linkText}</a>`;
      document.execCommand("insertHTML", false, anchorHtml);
    } else {
      document.execCommand("createLink", false, linkUrl);
    }

    handleInput();
    setShowLinkModal(false);
    setLinkUrl("");
    setLinkText("");
  };

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 border-b border-slate-200 text-slate-700 text-xs select-none">
        {/* Undo / Redo */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            exec("undo");
          }}
          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors"
          title="Undo"
        >
          <Undo className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            exec("redo");
          }}
          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors"
          title="Redo"
        >
          <Redo className="w-3.5 h-3.5" />
        </button>

        <span className="w-px h-4 bg-slate-300 mx-1" />

        {/* Headings */}
        <select
          defaultValue="p"
          onChange={(e) => {
            const tag = e.target.value;
            exec("formatBlock", `<${tag}>`);
          }}
          className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 cursor-pointer focus:outline-none"
        >
          <option value="p">Normal Text</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
        </select>

        {/* Font Size */}
        <select
          defaultValue=""
          onChange={(e) => {
            const size = e.target.value;
            if (size) {
              exec("fontSize", size);
            }
          }}
          className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 cursor-pointer focus:outline-none"
        >
          {FONT_SIZES.map((s) => (
            <option key={s.label} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <span className="w-px h-4 bg-slate-300 mx-1" />

        {/* Basic Styles */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            exec("bold");
          }}
          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 font-bold transition-colors"
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            exec("italic");
          }}
          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 transition-colors"
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            exec("underline");
          }}
          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 transition-colors"
          title="Underline (Ctrl+U)"
        >
          <Underline className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            exec("strikeThrough");
          }}
          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 transition-colors"
          title="Strikethrough"
        >
          <Strikethrough className="w-3.5 h-3.5" />
        </button>

        <span className="w-px h-4 bg-slate-300 mx-1" />

        {/* Lists & Quotes */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            exec("insertUnorderedList");
          }}
          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 transition-colors"
          title="Bullet List"
        >
          <List className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            exec("insertOrderedList");
          }}
          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 transition-colors"
          title="Numbered List"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            exec("formatBlock", "<blockquote>");
          }}
          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 transition-colors"
          title="Blockquote"
        >
          <Quote className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            exec("insertHorizontalRule");
          }}
          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 transition-colors"
          title="Horizontal Divider"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        <span className="w-px h-4 bg-slate-300 mx-1" />

        {/* Link / Unlink */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            setShowLinkModal(true);
          }}
          className="p-1.5 rounded-lg hover:bg-slate-200 text-blue-600 transition-colors"
          title="Insert Link"
        >
          <LinkIcon className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            exec("unlink");
          }}
          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 transition-colors"
          title="Remove Link"
        >
          <Unlink className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            exec("removeFormat");
          }}
          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 transition-colors"
          title="Clear Formatting"
        >
          <RemoveFormatting className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Editable Content Area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onBlur={handleInput}
        style={{ minHeight }}
        data-placeholder={placeholder}
        className="p-4 outline-none text-slate-800 text-xs sm:text-sm font-medium leading-relaxed prose prose-slate max-w-none empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 empty:before:pointer-events-none"
      />

      {/* Insert Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-bold text-xs text-slate-900">Insert Link</span>
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInsertLink} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Link URL *</label>
                <input
                  type="url"
                  required
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Display Text (Optional)</label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="e.g. Read clinical research"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="openInNewTabLink"
                  checked={openInNewTab}
                  onChange={(e) => setOpenInNewTab(e.target.checked)}
                  className="rounded text-blue-600 border-slate-300"
                />
                <label htmlFor="openInNewTabLink" className="text-slate-700 font-medium">
                  Open link in new tab
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded-xl text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-xl font-bold"
                >
                  Insert Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default RichTextEditor;
