import React from "react";
import Link from "next/link";
import { HeartHandshake, Home, Brain, PhoneCall } from "lucide-react";

export default function NotFound() {
  return (
    <div className="fixed inset-0 z-[100] min-h-screen w-screen bg-[#070b14] flex flex-col items-center justify-center p-6 overflow-y-auto selection:bg-blue-600 selection:text-white">
      {/* Background Technical Grid & Ambient Lighting Glows */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Soft Clinical Blue Spotlight Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-600/15 rounded-full blur-[140px]" />
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-sky-500/10 rounded-full blur-[120px]" />

        {/* Technical Coordinate Grid Lines (FabFit Inspired, Radiant Blue Theme) */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b33_1px,transparent_1px),linear-gradient(to_bottom,#1e293b33_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,#000_70%,transparent_100%)] opacity-70" />
      </div>

      {/* Main Content Hero Stack */}
      <div className="relative z-10 w-full max-w-2xl text-center flex flex-col items-center space-y-6 my-auto py-8">
        {/* Center Glowing Icon Squircle */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-slate-900/90 border border-slate-700/80 flex items-center justify-center shadow-2xl shadow-blue-500/25">
          {/* Subtle Radar Pulse Dot */}
          <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-blue-400 animate-ping opacity-75" />
          <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-sky-400 shadow-md shadow-sky-400/50" />

          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-inner">
            <HeartHandshake className="w-8 h-8 sm:w-9 sm:h-9" />
          </div>
        </div>

        {/* 404 Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-950/70 border border-blue-500/30 text-sky-400 text-xs font-black uppercase tracking-widest backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
          <span>404 // CLINICAL PATHWAY UNAVAILABLE</span>
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
        </div>

        {/* Giant Monolithic 404 Headline */}
        <div className="space-y-3">
          <h1 className="text-8xl sm:text-9xl md:text-[11rem] font-black tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-500 select-none drop-shadow-2xl font-mono">
            404
          </h1>

          <div className="inline-block px-3.5 py-1 bg-sky-500/10 border border-sky-400/20 rounded-md text-[11px] sm:text-xs font-black tracking-[0.2em] uppercase text-sky-400">
            PAGE DEACTIVATED OR ARCHIVED
          </div>
        </div>

        {/* Descriptive Headings */}
        <div className="space-y-3 max-w-xl">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
            PAGE NOT FOUND
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-slate-400 max-w-lg mx-auto font-medium leading-relaxed">
            We couldn&apos;t find the clinical page you requested. The page might have been deactivated by clinical administration or moved. Explore our therapy programs or return to the home base to get back on track.
          </p>
        </div>

        {/* Action Button Triad (FabFit Inspired, Radiant Blue Theme) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-3 w-full max-w-md sm:max-w-xl">
          <Link
            href="/"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 transition-all cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>HOME BASE &rarr;</span>
          </Link>

          <Link
            href="/services"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-bold text-xs uppercase tracking-wider hover:border-slate-600 transition-all cursor-pointer"
          >
            <Brain className="w-4 h-4 text-sky-400" />
            <span>PROGRAMS</span>
          </Link>

          <Link
            href="/contact"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-bold text-xs uppercase tracking-wider hover:border-slate-600 transition-all cursor-pointer"
          >
            <PhoneCall className="w-4 h-4 text-slate-400" />
            <span>CONTACT US</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
