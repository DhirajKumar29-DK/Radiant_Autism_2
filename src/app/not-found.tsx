import React from "react";
import Link from "next/link";
import { HeartHandshake, Home, ArrowLeft, PhoneCall } from "lucide-react";

export default function NotFound() {
  return (
    <div className="fixed inset-0 z-[100] min-h-screen w-screen bg-slate-50 flex items-center justify-center p-4 overflow-y-auto select-none">
      {/* Background Soft Light Ambient Glows & Dot Grid */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-sky-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-100/50 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      <div className="max-w-md w-full text-center relative z-10 space-y-6 bg-white/90 backdrop-blur-md p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl shadow-slate-900/5 my-auto">
        {/* Brand Logo */}
        <div className="flex items-center justify-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-600/25">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div className="text-left">
            <span className="text-base font-black tracking-tight bg-gradient-to-r from-blue-900 via-sky-700 to-indigo-800 bg-clip-text text-transparent block leading-tight">
              RADIANT
            </span>
            <span className="block text-[9px] font-black tracking-widest text-slate-500 uppercase">
              Autism & Skill Center
            </span>
          </div>
        </div>

        {/* 404 Badge & Headings */}
        <div className="space-y-2 pt-2">
          <span className="inline-block px-3 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-black uppercase tracking-widest">
            Error 404 — Page Unavailable
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Page Not Found or Deactivated
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
            The page you are looking for has been deactivated by clinical administration or does not exist on this website.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-md shadow-blue-600/25 hover:shadow-lg hover:shadow-blue-600/35 transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Return to Homepage</span>
          </Link>
          <Link
            href="/contact"
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs uppercase tracking-wider border border-slate-200 shadow-xs transition-all flex items-center justify-center gap-2"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Get Support</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
