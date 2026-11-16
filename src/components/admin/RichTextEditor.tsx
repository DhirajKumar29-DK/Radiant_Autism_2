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
  Highlighter,
  Baseline,
  ChevronDown,
  X,
  Code,
  Eye,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

const TEXT_COLOR_PRESETS = [
  { name: "Default Dark", hex: "inherit" },
  { name: "Radiant Blue", hex: "#2563eb" },
  { name: "Clinical Teal", hex: "#0d9488" },
  { name: "Emerald Green", hex: "#10b981" },
  { name: "Amber Orange", hex: "#f59e0b" },
  { name: "Rose Red", hex: "#ef4444" },
  { name: "Purple", hex: "#8b5cf6" },
  { name: "Slate Gray", hex: "#64748b" },
];

const HIGHLIGHT_COLOR_PRESETS = [
  { name: "Yellow Highlight", hex: "#fef08a" },
  { name: "Soft Blue Highlight", hex: "#bfdbfe" },
  { name: "Soft Green Highlight", hex: "#bbf7d0" },
  { name: "Soft Amber Highlight", hex: "#fed7aa" },
  { name: "Soft Purple Highlight", hex: "#e9d5ff" },
];

const FONT_SIZES = [
  { label: "Size", value: "" },
  { label: "12px", value: "12px" },
  { label: "14px", value: "14px" },
  { label: "16px", value: "16px" },
  { label: "18px", value: "18px" },
  { label: "20px", value: "20px" },
  { label: "24px", value: "24px" },
];

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write full article or clinical description here...",
  minHeight = "240px",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [editorMode, setEditorMode] = useState<"visual" | "html">("visual");
  const [rawHtml, setRawHtml] = useState<string>(value || "");

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [openInNewTab, setOpenInNewTab] = useState(true);

  // Sync initial or outside value into editorRef
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value && editorMode === "visual") {
      editorRef.current.innerHTML = value || "";
    }
    setRawHtml(value || "");
  }, [value, editorMode]);

  const exec = (command: string, val: string | undefined = undefined) => {
    document.execCommand(command, false, val);
    handleInput();
  };

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setRawHtml(html);
      onChange(html);
    }
  };

  const handleRawHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextHtml = e.target.value;
    setRawHtml(nextHtml);
    onChange(nextHtml);
  };

  const handleInsertLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrl) return;

    if (linkText) {
      const targetAttr = openInNewTab ? ' target="_blank" rel="noopener noreferrer"' : "";
      const anchorHtml = `<a href="${linkUrl}"${targetAttr} class="text-blue-600 underline font-semibold">${linkText}</a>`;
      exec("insertHTML", anchorHtml);
    } else {
      exec("createLink", linkUrl);
    }

    setShowLinkModal(false);
    setLinkUrl("");
    setLinkText("");
  };

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 border-b border-slate-200 text-slate-700 text-xs">
        {/* Undo / Redo */}
        <button
          type="button"
          onClick={() => exec("undo")}
          className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          title="Undo"
        >
          <Undo className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => exec("redo")}
          className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          title="Redo"
        >
          <Redo className="w-3.5 h-3.5" />
        </button>

        <span className="w-px h-4 bg-slate-300 mx-1" />

        {/* Headings */}
        <select
          onChange={(e) => {
            const tag = e.target.value;
            if (tag === "p") exec("formatBlock", "<p>");
            else if (tag === "h1") exec("formatBlock", "<h1>");
            else if (tag === "h2") exec("formatBlock", "<h2>");
            else if (tag === "h3") exec("formatBlock", "<h3>");
          }}
          className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 cursor-pointer"
        >
          <option value="p">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
        </select>

        {/* Font Size */}
        <select
          onChange={(e) => {
            const size = e.target.value;
            if (size) {
              exec("fontSize", "3");
            }
          }}
          className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 cursor-pointer"
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
          onClick={() => exec("bold")}
          className="p-1.5 rounded-lg hover:bg-slate-200 font-bold transition-colors"
          title="Bold"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => exec("italic")}
          className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          title="Italic"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => exec("underline")}
          className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          title="Underline"
        >
          <Underline className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => exec("strikeThrough")}
          className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          title="Strikethrough"
        >
          <Strikethrough className="w-3.5 h-3.5" />
        </button>

        <span className="w-px h-4 bg-slate-300 mx-1" />

        {/* Text Color Picker */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowColorPicker(!showColorPicker);
              setShowHighlightPicker(false);
            }}
            className="p-1.5 rounded-lg hover:bg-slate-200 flex items-center gap-0.5 transition-colors"
            title="Text Color"
          >
            <Baseline className="w-3.5 h-3.5" />
            <ChevronDown className="w-2.5 h-2.5" />
          </button>
          {showColorPicker && (
            <div className="absolute left-0 top-full mt-1 bg-white border border-slate-200 shadow-xl rounded-xl p-2 z-20 flex flex-col gap-1 w-36">
              {TEXT_COLOR_PRESETS.map((color) => (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => {
                    exec("foreColor", color.hex);
                    setShowColorPicker(false);
                  }}
                  className="flex items-center gap-2 px-2 py-1 text-[11px] rounded hover:bg-slate-50 text-left"
                >
                  <span
                    className="w-3 h-3 rounded-full border border-slate-300"
                    style={{ backgroundColor: color.hex === "inherit" ? "#000" : color.hex }}
                  />
                  <span>{color.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Highlight Color Picker */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowHighlightPicker(!showHighlightPicker);
              setShowColorPicker(false);
            }}
            className="p-1.5 rounded-lg hover:bg-slate-200 flex items-center gap-0.5 transition-colors"
            title="Highlight Color"
          >
            <Highlighter className="w-3.5 h-3.5 text-amber-600" />
            <ChevronDown className="w-2.5 h-2.5" />
          </button>
          {showHighlightPicker && (
            <div className="absolute left-0 top-full mt-1 bg-white border border-slate-200 shadow-xl rounded-xl p-2 z-20 flex flex-col gap-1 w-40">
              {HIGHLIGHT_COLOR_PRESETS.map((color) => (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => {
                    exec("hiliteColor", color.hex);
                    setShowHighlightPicker(false);
                  }}
                  className="flex items-center gap-2 px-2 py-1 text-[11px] rounded hover:bg-slate-50 text-left"
                >
                  <span
                    className="w-3 h-3 rounded-full border border-slate-300"
                    style={{ backgroundColor: color.hex }}
                  />
                  <span>{color.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <span className="w-px h-4 bg-slate-300 mx-1" />

        {/* Lists & Quotes */}
        <button
          type="button"
          onClick={() => exec("insertUnorderedList")}
          className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          title="Bullet List"
        >
          <List className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => exec("insertOrderedList")}
          className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          title="Numbered List"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => exec("formatBlock", "<blockquote>")}
          className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          title="Blockquote"
        >
          <Quote className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => exec("insertHorizontalRule")}
          className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          title="Horizontal Divider"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        <span className="w-px h-4 bg-slate-300 mx-1" />

        {/* Link / Unlink */}
        <button
          type="button"
          onClick={() => setShowLinkModal(true)}
          className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          title="Insert Link"
        >
          <LinkIcon className="w-3.5 h-3.5 text-blue-600" />
        </button>
        <button
          type="button"
          onClick={() => exec("unlink")}
          className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          title="Remove Link"
        >
          <Unlink className="w-3.5 h-3.5 text-slate-400" />
        </button>
        <button
          type="button"
          onClick={() => exec("removeFormat")}
          className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          title="Clear Formatting"
        >
          <RemoveFormatting className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {/* Visual vs HTML Code Mode Switch */}
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => setEditorMode(editorMode === "visual" ? "html" : "visual")}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors ${
              editorMode === "html"
                ? "bg-slate-900 text-white"
                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
            title="Toggle Raw HTML Mode"
          >
            {editorMode === "html" ? <Eye className="w-3 h-3" /> : <Code className="w-3 h-3" />}
            <span>{editorMode === "html" ? "Visual" : "HTML"}</span>
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      {editorMode === "visual" ? (
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          style={{ minHeight }}
          data-placeholder={placeholder}
          className="p-4 outline-none text-slate-800 text-xs sm:text-sm font-medium leading-relaxed prose prose-slate max-w-none empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 empty:before:pointer-events-none"
        />
      ) : (
        <textarea
          value={rawHtml}
          onChange={handleRawHtmlChange}
          style={{ minHeight }}
          className="w-full p-4 font-mono text-xs text-slate-800 bg-slate-50 outline-none resize-y"
        />
      )}

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
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Display Text (Optional)</label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="e.g. Read clinical research"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
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
                  className="px-3 py-1.5 border border-slate-200 rounded-xl text-slate-600"
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
