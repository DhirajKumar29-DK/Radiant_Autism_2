import React from "react";
import Link from "next/link";
import { HeartHandshake, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-20 bg-slate-50 relative overflow-hidden">
      {/* Background soft ambient glows */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-blue-100/60 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-sky-200/40 rounded-full blur-3xl" />
      </div>

      <div className="max-w-md w-full text-center relative z-10 space-y-6">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-blue-600/10 border border-blue-200 flex items-center justify-center text-blue-600 shadow-sm">
          <HeartHandshake className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-blue-600">
            Error 404 — Page Unavailable
          </span>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Page Not Found or Deactivated
          </h1>
          <p className="text-sm text-slate-600 font-medium leading-relaxed">
            The page you are looking for is currently disabled by clinical administration or does not exist.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Return to Homepage</span>
          </Link>
          <Link
            href="/contact"
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 font-extrabold text-xs uppercase tracking-wider border border-slate-200 shadow-xs transition-all flex items-center justify-center gap-2"
          >
            <span>Get In Touch</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
