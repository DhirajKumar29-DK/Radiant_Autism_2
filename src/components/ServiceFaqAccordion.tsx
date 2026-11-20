"use client";

import React, { useState } from "react";
import { HelpCircle, ChevronDown } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

interface ServiceFaqAccordionProps {
  faqs: FaqItem[];
}

export default function ServiceFaqAccordion({ faqs }: ServiceFaqAccordionProps) {
  // First item open by default (or null if preferred)
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!faqs || faqs.length === 0) return null;

  const toggleFaq = (idx: number) => {
    // If the clicked FAQ is already open, close it; otherwise open it and close all others
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="space-y-3.5 mt-8 sm:mt-10">
      {faqs.map((faq, idx) => {
        const isOpen = openIndex === idx;

        return (
          <div
            key={idx}
            className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
              isOpen
                ? "border-blue-500/60 shadow-md shadow-blue-500/5 ring-1 ring-blue-500/20"
                : "border-slate-200/90 shadow-2xs hover:border-slate-300 hover:shadow-xs"
            }`}
          >
            <button
              type="button"
              onClick={() => toggleFaq(idx)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between p-5 sm:p-6 text-left cursor-pointer gap-4 transition-colors group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isOpen
                      ? "bg-blue-50 text-blue-600"
                      : "bg-slate-100 text-slate-500 group-hover:text-blue-600 group-hover:bg-blue-50/50"
                  }`}
                >
                  <HelpCircle className="w-4 h-4" />
                </div>
                <h3
                  className={`text-sm sm:text-base font-bold transition-colors ${
                    isOpen ? "text-blue-900" : "text-slate-900 group-hover:text-blue-600"
                  }`}
                >
                  {faq.question}
                </h3>
              </div>

              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300 ${
                  isOpen
                    ? "bg-blue-100/70 text-blue-700 rotate-180"
                    : "bg-slate-100 text-slate-400 group-hover:text-slate-600 group-hover:bg-slate-200/70"
                }`}
              >
                <ChevronDown className="w-4 h-4" />
              </div>
            </button>

            {/* Collapsible Answer */}
            <div
              className={`grid transition-all duration-300 ease-in-out ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-1 text-slate-600 text-xs sm:text-sm leading-relaxed border-t border-slate-100/80">
                  <div className="pl-11 pr-2 pt-2">{faq.answer}</div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
