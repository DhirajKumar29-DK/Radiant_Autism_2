"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronRight,
  ChevronLeft,
  Calendar,
} from "lucide-react";

export default function Hero() {
  const defaultSlides = [
    {
      id: 1,
      badge: "OAP COVERED & RBA SUPERVISED",
      title: "ABA Therapy (Applied Behavior Analysis)",
      subtitle: "Personalized, evidence-based, and compassionate interventions.",
      ctaPrimary: "BOOK APPOINTMENT",
      ctaPrimaryLink: "/contact",
      ctaSecondary: "OUR SERVICES",
      ctaSecondaryLink: "/services",
      bgImage: "/hero_bg_aba.jpg",
    },
    {
      id: 2,
      badge: "SPEECH & LANGUAGE CARE",
      title: "Speech and Language Service (SLP)",
      subtitle: "Strengthening articulation, verbal communication, and everyday confidence.",
      ctaPrimary: "BOOK APPOINTMENT",
      ctaPrimaryLink: "/contact",
      ctaSecondary: "OUR SERVICES",
      ctaSecondaryLink: "/services",
      bgImage: "/hero_bg_speech.jpg",
    },
    {
      id: 3,
      badge: "MOTOR & SENSORY DEVELOPMENT",
      title: "Occupational Therapy & Life Skills",
      subtitle: "Supporting fine and gross motor needs, sensory regulation, and group programs.",
      ctaPrimary: "BOOK APPOINTMENT",
      ctaPrimaryLink: "/contact",
      ctaSecondary: "ABOUT OUR CLINIC",
      ctaSecondaryLink: "/about",
      bgImage: "/gallery_sensory_gym.jpg",
    },
  ];

  const [slides, setSlides] = useState(defaultSlides);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchHero = async () => {
      try {
        const res = await fetch("/api/admin/hero?status=ACTIVE");
        if (res.ok) {
          const data = await res.json();
          const items = data.heroes || data.data;
          if (Array.isArray(items) && items.length > 0) {
            const mapped = items.map((h: any, idx: number) => ({
              id: h.id || idx + 1,
              badge: h.badge || "OAP COVERED & RBA SUPERVISED",
              title: h.title,
              subtitle: h.subtitle || "",
              ctaPrimary: h.primaryButtonText || "BOOK APPOINTMENT",
              ctaPrimaryLink: h.primaryButtonLink || "/contact",
              ctaSecondary: h.secondaryButtonText || "OUR SERVICES",
              ctaSecondaryLink: h.secondaryButtonLink || "/services",
              bgImage: h.backgroundImage || "/hero_bg_aba.jpg",
            }));
            setSlides(mapped);
          }
        }
      } catch (err) {
        // Fallback to defaultSlides
      }
    };
    fetchHero();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section className="relative w-full h-[calc(100vh-5rem)] min-h-[550px] bg-slate-950 overflow-hidden select-none">
      {/* Background Image Slider with Fade & Zoom Transition */}
      {slides.map((slide, idx) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${currentSlide === idx ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
        >
          <img
            src={slide.bgImage}
            alt={slide.title}
            className={`w-full h-full object-cover object-center transform transition-transform duration-1000 ${currentSlide === idx ? "opacity-100 animate-kenburns" : "opacity-90"
              }`}
          />
          {/* Gradient Overlay for high readability & vibrant image visibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/75 via-slate-950/45 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-slate-950/20" />
        </div>
      ))}

      {/* Main Content Area: Shifted Further Left for Desktop */}
      <div className="relative z-20 w-full h-full px-4 sm:px-8 lg:px-12 xl:px-16 flex flex-col justify-between py-6 sm:py-8 lg:py-10">
        {/* Left Aligned Main Text & Action Buttons */}
        <div className="max-w-3xl space-y-5 my-auto text-left lg:ml-4 xl:ml-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-amber-300 text-xs font-extrabold uppercase tracking-wider">
            <span>{slides[currentSlide].badge}</span>
          </div>

          {/* Large Bold Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight sm:leading-tight">
            {slides[currentSlide].title}
          </h1>

          {/* Subtitle */}
          <p className="text-slate-200 text-base sm:text-xl font-medium leading-relaxed max-w-2xl">
            {slides[currentSlide].subtitle}
          </p>

          {/* Dual Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2 sm:pt-4">
            <Link
              href={slides[currentSlide].ctaPrimaryLink}
              className="px-7 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-blue-600/40 hover:shadow-blue-600/60 transition-all flex items-center gap-2 group transform hover:-translate-y-0.5"
            >
              <Calendar className="w-4 h-4" />
              <span>{slides[currentSlide].ctaPrimary}</span>
            </Link>

            <Link
              href={slides[currentSlide].ctaSecondaryLink}
              className="px-7 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-md font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-md transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
            >
              <span>{slides[currentSlide].ctaSecondary}</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Clean Slider Navigation Controls */}
        <div className="flex items-center justify-between z-20 text-white text-xs pt-2 lg:px-4 xl:px-8">
          {/* Left: Indicator Dots */}
          <div className="flex items-center gap-3">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 ${currentSlide === idx ? "w-8 bg-blue-500" : "w-2.5 bg-white/40"
                  }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Right Prev/Next Arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              type="button"
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              type="button"
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
