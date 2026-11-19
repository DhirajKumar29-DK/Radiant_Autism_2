"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
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
  ChevronDown,
  Palette,
  Highlighter,
  Eye,
  Code,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

const FONT_SIZES = [
  { label: "Small (13px)", sizeNum: "2", px: "13px" },
  { label: "Normal (15px)", sizeNum: "3", px: "15px" },
  { label: "Medium (18px)", sizeNum: "4", px: "18px" },
  { label: "Large (22px)", sizeNum: "5", px: "22px" },
  { label: "Extra Large (28px)", sizeNum: "6", px: "28px" },
  { label: "Huge (34px)", sizeNum: "7", px: "34px" },
];

const TEXT_COLORS = [
  { label: "Default Dark", color: "#1e293b" },
  { label: "Radiant Blue", color: "#2563eb" },
  { label: "Emerald Green", color: "#059669" },
  { label: "Rose Red", color: "#e11d48" },
  { label: "Amber Orange", color: "#d97706" },
  { label: "Purple Indigo", color: "#6366f1" },
  { label: "Slate Gray", color: "#64748b" },
];

const HIGHLIGHT_COLORS = [
  { label: "Yellow", color: "#fef08a" },
  { label: "Emerald", color: "#bbf7d0" },
  { label: "Blue", color: "#bfdbfe" },
  { label: "Pink", color: "#fbcfe8" },
  { label: "Amber", color: "#fed7aa" },
  { label: "None", color: "transparent" },
];

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write comprehensive clinical article content here...",
  minHeight = "260px",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"visual" | "html">("visual");

  // Active styles state
  const [currentBlock, setCurrentBlock] = useState<string>("p");
  const [currentFontSize, setCurrentFontSize] = useState<string>("15px");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrike, setIsStrike] = useState(false);

  // Dropdown states
  const [isSizeOpen, setIsSizeOpen] = useState(false);
  const [isColorOpen, setIsColorOpen] = useState(false);
  const [isHighlightOpen, setIsHighlightOpen] = useState(false);

  // Link Modal
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [openInNewTab, setOpenInNewTab] = useState(true);

  // Saved selection range
  const savedRangeRef = useRef<Range | null>(null);

  const saveSelection = () => {
    if (typeof window === "undefined") return;
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editorRef.current) {
      const node = sel.anchorNode;
      if (node && editorRef.current.contains(node)) {
        savedRangeRef.current = sel.getRangeAt(0).cloneRange();
      }
    }
  };

  const restoreSelection = () => {
    if (typeof window === "undefined") return;
    if (editorRef.current) {
      editorRef.current.focus();
    }
    if (savedRangeRef.current) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedRangeRef.current);
      }
    }
  };

  // Sync external value when not focused
  useEffect(() => {
    if (editorRef.current && mode === "visual") {
      const isFocused = document.activeElement === editorRef.current;
      if (!isFocused && editorRef.current.innerHTML !== (value || "")) {
        editorRef.current.innerHTML = value || "";
      }
    }
  }, [value, mode]);

  // Set default paragraph separator to <p>
  useEffect(() => {
    if (typeof document !== "undefined") {
      try {
        document.execCommand("defaultParagraphSeparator", false, "p");
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".editor-dropdown-container")) {
        setIsSizeOpen(false);
        setIsColorOpen(false);
        setIsHighlightOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const checkActiveStyles = useCallback(() => {
    if (typeof window === "undefined" || mode === "html") return;
    try {
      setIsBold(Boolean(document.queryCommandState("bold")));
      setIsItalic(Boolean(document.queryCommandState("italic")));
      setIsUnderline(Boolean(document.queryCommandState("underline")));
      setIsStrike(Boolean(document.queryCommandState("strikeThrough")));

      const sel = window.getSelection();
      if (sel && sel.anchorNode && editorRef.current) {
        let el: HTMLElement | null = null;
        if (sel.anchorNode.nodeType === Node.TEXT_NODE) {
          el = sel.anchorNode.parentElement;
        } else if (sel.anchorNode.nodeType === Node.ELEMENT_NODE) {
          el = sel.anchorNode as HTMLElement;
        }

        if (el && editorRef.current.contains(el)) {
          // 1. Detect Block Tag (H1, H2, H3, H4, P, BLOCKQUOTE)
          let curr: HTMLElement | null = el;
          let block = "p";
          while (curr && curr !== editorRef.current) {
            const tag = curr.tagName.toLowerCase();
            if (["h1", "h2", "h3", "h4", "p", "blockquote"].includes(tag)) {
              block = tag;
              break;
            }
            curr = curr.parentElement;
          }
          setCurrentBlock(block);

          // 2. Detect Computed Font Size
          const compStyle = window.getComputedStyle(el);
          if (compStyle && compStyle.fontSize) {
            const rawPx = Math.round(parseFloat(compStyle.fontSize));
            setCurrentFontSize(`${rawPx}px`);
          }
        }
      }
    } catch {
      // Ignored
    }
  }, [mode]);

  // Real-time selection change listener (tracks cursor on any click or keyboard navigation)
  useEffect(() => {
    const handleSelectionChange = () => {
      if (typeof window === "undefined" || mode === "html") return;
      const sel = window.getSelection();
      if (sel && sel.anchorNode && editorRef.current && editorRef.current.contains(sel.anchorNode)) {
        checkActiveStyles();
      }
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => document.removeEventListener("selectionchange", handleSelectionChange);
  }, [mode, checkActiveStyles]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      onChange(html);
    }
    checkActiveStyles();
  }, [onChange, checkActiveStyles]);

  const exec = (command: string, val: string | undefined = undefined) => {
    if (mode === "html") return;
    restoreSelection();
    document.execCommand(command, false, val);
    handleInput();
  };

  // Block Heading Formatter
  const formatHeading = (tag: "h1" | "h2" | "h3" | "p") => {
    if (mode === "html") return;
    restoreSelection();
    const arg = `<${tag}>`;
    const ok = document.execCommand("formatBlock", false, arg);
    if (!ok) {
      document.execCommand("formatBlock", false, tag);
    }
    setCurrentBlock(tag);
    handleInput();
  };

  // Font Size Applier
  const applyFontSize = (sizeNum: string) => {
    if (mode === "html") return;
    restoreSelection();
    document.execCommand("fontSize", false, sizeNum);
    handleInput();
    setIsSizeOpen(false);
  };

  // Text Color Applier
  const applyTextColor = (color: string) => {
    if (mode === "html") return;
    restoreSelection();
    document.execCommand("foreColor", false, color);
    handleInput();
    setIsColorOpen(false);
  };

  // Highlight Color Applier
  const applyHighlight = (color: string) => {
    if (mode === "html") return;
    restoreSelection();
    document.execCommand("hiliteColor", false, color);
    handleInput();
    setIsHighlightOpen(false);
  };

  // Clean words & char count
  const cleanText = (value || "").replace(/<[^>]*>/g, " ").trim();
  const wordCount = cleanText ? cleanText.split(/\s+/).filter(Boolean).length : 0;
  const charCount = cleanText.length;

  // Insert Link Handler
  const handleInsertLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrl) return;

    restoreSelection();

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
    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all flex flex-col relative">
      {/* Top Toolbar (STICKY at the top with explicit rounded top corners) */}
      <div className="sticky top-0 z-30 flex flex-wrap items-center gap-1.5 p-2.5 bg-slate-50/98 backdrop-blur-md border-b border-slate-200 text-slate-700 text-xs select-none shadow-2xs rounded-t-2xl">
        {/* Headings Button Group (H1, H2, H3, Paragraph) with Active Highlighting */}
        <div className="flex items-center gap-1 bg-white p-0.5 rounded-xl border border-slate-200 shadow-2xs">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              formatHeading("h1");
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
              currentBlock === "h1"
                ? "bg-blue-600 text-white shadow-xs ring-1 ring-blue-700"
                : "text-slate-700 hover:bg-slate-100"
            }`}
            title="Heading 1 (Main Section Title - 32px)"
          >
            H1
          </button>

          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              formatHeading("h2");
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
              currentBlock === "h2"
                ? "bg-blue-600 text-white shadow-xs ring-1 ring-blue-700"
                : "text-slate-700 hover:bg-slate-100"
            }`}
            title="Heading 2 (Sub-section Title - 24px)"
          >
            H2
          </button>

          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              formatHeading("h3");
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
              currentBlock === "h3"
                ? "bg-blue-600 text-white shadow-xs ring-1 ring-blue-700"
                : "text-slate-700 hover:bg-slate-100"
            }`}
            title="Heading 3 (Sub-heading - 20px)"
          >
            H3
          </button>

          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              formatHeading("p");
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              currentBlock === "p"
                ? "bg-blue-600 text-white shadow-xs font-black ring-1 ring-blue-700"
                : "text-slate-700 hover:bg-slate-100"
            }`}
            title="Normal Paragraph Text (15px)"
          >
            Paragraph
          </button>
        </div>

        {/* Font Size Dropdown (Shows exact active size of clicked text) */}
        <div className="relative editor-dropdown-container">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              saveSelection();
              setIsSizeOpen(!isSizeOpen);
              setIsColorOpen(false);
              setIsHighlightOpen(false);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 transition-colors shadow-2xs cursor-pointer"
            title="Current Font Size - Click to Change"
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase">Size:</span>
            <span className="font-mono text-blue-600 font-black">{currentFontSize}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isSizeOpen && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-1.5 space-y-0.5 animate-in fade-in duration-150">
              <div className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                Active Size: {currentFontSize}
              </div>
              {FONT_SIZES.map((item) => {
                const isMatch = currentFontSize === item.px;
                return (
                  <button
                    key={item.sizeNum}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      applyFontSize(item.sizeNum);
                      setCurrentFontSize(item.px);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                      isMatch
                        ? "bg-blue-600 text-white font-black shadow-xs"
                        : "hover:bg-blue-50 hover:text-blue-600 text-slate-700"
                    }`}
                  >
                    <span>{item.label}</span>
                    {isMatch && <span className="font-black">✓</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <span className="w-px h-5 bg-slate-300 mx-0.5" />

        {/* B, I, U, S Formatters (High contrast active indicator) */}
        <div className="flex items-center gap-0.5 bg-white p-0.5 rounded-xl border border-slate-200 shadow-2xs">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              exec("bold");
            }}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              isBold
                ? "bg-blue-600 text-white font-black shadow-xs ring-1 ring-blue-700"
                : "text-slate-700 hover:bg-slate-100"
            }`}
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
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              isItalic
                ? "bg-blue-600 text-white font-black shadow-xs ring-1 ring-blue-700"
                : "text-slate-700 hover:bg-slate-100"
            }`}
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
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              isUnderline
                ? "bg-blue-600 text-white font-black shadow-xs ring-1 ring-blue-700"
                : "text-slate-700 hover:bg-slate-100"
            }`}
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
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              isStrike
                ? "bg-blue-600 text-white font-black shadow-xs ring-1 ring-blue-700"
                : "text-slate-700 hover:bg-slate-100"
            }`}
            title="Strikethrough"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Text Color Picker */}
        <div className="relative editor-dropdown-container">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              saveSelection();
              setIsColorOpen(!isColorOpen);
              setIsSizeOpen(false);
              setIsHighlightOpen(false);
            }}
            className="flex items-center gap-1 px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 transition-colors shadow-2xs cursor-pointer"
            title="Text Color"
          >
            <span className="font-serif font-black text-sm text-blue-600">A</span>
            <ChevronDown className="w-2.5 h-2.5 text-slate-500" />
          </button>

          {isColorOpen && (
            <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2 space-y-1 animate-in fade-in duration-150">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1">
                Text Color
              </span>
              {TEXT_COLORS.map((c) => (
                <button
                  key={c.color}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    applyTextColor(c.color);
                  }}
                  className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-50 flex items-center gap-2 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0"
                    style={{ backgroundColor: c.color }}
                  />
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Highlight Picker */}
        <div className="relative editor-dropdown-container">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              saveSelection();
              setIsHighlightOpen(!isHighlightOpen);
              setIsSizeOpen(false);
              setIsColorOpen(false);
            }}
            className="flex items-center gap-1 px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 transition-colors shadow-2xs cursor-pointer"
            title="Highlight Text Background"
          >
            <Highlighter className="w-3.5 h-3.5 text-amber-500" />
            <ChevronDown className="w-2.5 h-2.5 text-slate-500" />
          </button>

          {isHighlightOpen && (
            <div className="absolute top-full left-0 mt-1 w-36 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2 space-y-1 animate-in fade-in duration-150">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1">
                Highlight
              </span>
              {HIGHLIGHT_COLORS.map((h) => (
                <button
                  key={h.color}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    applyHighlight(h.color);
                  }}
                  className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-50 flex items-center gap-2 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0"
                    style={{ backgroundColor: h.color === "transparent" ? "#fff" : h.color }}
                  />
                  <span>{h.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <span className="w-px h-5 bg-slate-300 mx-0.5" />

        {/* Lists & Quotes & Divider */}
        <div className="flex items-center gap-0.5 bg-white p-0.5 rounded-xl border border-slate-200 shadow-2xs">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              exec("insertUnorderedList");
            }}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
            title="Bullet List (•)"
          >
            <List className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              exec("insertOrderedList");
            }}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
            title="Numbered List (1, 2, 3)"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              formatHeading("p");
              exec("formatBlock", "<blockquote>");
            }}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
            title="Blockquote Callout"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              exec("insertHorizontalRule");
            }}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
            title="Divider Line"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Link / Remove Format */}
        <div className="flex items-center gap-0.5 bg-white p-0.5 rounded-xl border border-slate-200 shadow-2xs">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              saveSelection();
              setShowLinkModal(true);
            }}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-blue-600 transition-colors cursor-pointer"
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
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors cursor-pointer"
            title="Unlink"
          >
            <Unlink className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              exec("removeFormat");
            }}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-rose-500 transition-colors cursor-pointer"
            title="Clear Formatting"
          >
            <RemoveFormatting className="w-3.5 h-3.5" />
          </button>
        </div>

        <span className="w-px h-5 bg-slate-300 mx-0.5" />

        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5 bg-white p-0.5 rounded-xl border border-slate-200 shadow-2xs">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              exec("undo");
            }}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
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
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
            title="Redo"
          >
            <Redo className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Editor Content Area (Scrollable with Sticky Toolbar on Top) */}
      <div className="overflow-y-auto max-h-[460px] min-h-[260px] bg-white">
        {mode === "visual" ? (
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            onBlur={handleInput}
            onKeyUp={() => {
              saveSelection();
              checkActiveStyles();
            }}
            onMouseUp={() => {
              saveSelection();
              checkActiveStyles();
            }}
            style={{ minHeight: "260px" }}
            data-placeholder={placeholder}
            className="rich-editor-content p-5 outline-none text-slate-800 text-sm font-normal leading-relaxed empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 empty:before:pointer-events-none"
          />
        ) : (
          <textarea
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter raw HTML article markup here..."
            style={{ minHeight: "260px" }}
            className="w-full h-full min-h-[260px] p-5 font-mono text-xs text-emerald-400 bg-slate-950 outline-none leading-relaxed resize-y border-none"
          />
        )}
      </div>

      {/* Editor Footer Bar (Pinned at bottom with explicit rounded bottom corners) */}
      <div className="sticky bottom-0 z-20 flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500 font-medium rounded-b-2xl">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-mono text-[10px] font-bold text-slate-700 shadow-2xs">
            <span className="text-slate-400">BLOCK:</span>
            <span className="text-blue-600 uppercase font-black">{currentBlock}</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-400">SIZE:</span>
            <span className="text-blue-600 font-black">{currentFontSize}</span>
            {isBold && <span className="text-emerald-600 font-black">• BOLD</span>}
            {isItalic && <span className="text-purple-600 font-black">• ITALIC</span>}
            {isUnderline && <span className="text-amber-600 font-black">• UNDERLINE</span>}
            {isStrike && <span className="text-rose-600 font-black">• STRIKE</span>}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="font-mono text-slate-600">
            {wordCount} words • {charCount} characters
          </span>

          <div className="flex items-center gap-1 border border-slate-200 rounded-xl p-0.5 bg-white text-[10px] font-bold shadow-2xs">
            <button
              type="button"
              onClick={() => setMode("visual")}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                mode === "visual"
                  ? "bg-blue-600 text-white shadow-xs font-black"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>Visual</span>
            </button>

            <button
              type="button"
              onClick={() => setMode("html")}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                mode === "html"
                  ? "bg-blue-600 text-white shadow-xs font-black"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Code className="w-3 h-3" />
              <span>&lt;&gt; HTML</span>
            </button>
          </div>
        </div>
      </div>

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
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Display Text (Optional)</label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="e.g. Read clinical research"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
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
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700"
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
