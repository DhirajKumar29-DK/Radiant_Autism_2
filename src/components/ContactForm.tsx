"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  Send,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  Loader2,
  RotateCcw,
  FileText,
  Calendar,
  Clock,
  User,
  AlertCircle,
  ChevronDown,
  Check,
  X,
  Navigation,
  ExternalLink,
  Copy,
} from "lucide-react";

const DEFAULT_SERVICE_OPTIONS = [
  "ABA Therapy (Applied Behavior Analysis)",
  "Speech and Language Service (SLP)",
  "Occupational Therapy (OT)",
  "Life Skills & Group Programs",
];
const OTHER_SERVICE_OPTION = "Other / Not Decided Yet (Need Clinical Assessment)";

export default function ContactForm() {
  const searchParams = useSearchParams();
  const preselectedService = searchParams?.get("service") || "";
  const formCardRef = useRef<HTMLDivElement>(null);

  // Dynamic services loaded from active services + 1 Other option
  const [serviceOptions, setServiceOptions] = useState<string[]>([
    ...DEFAULT_SERVICE_OPTIONS,
    OTHER_SERVICE_OPTION,
  ]);

  useEffect(() => {
    async function fetchActiveServices() {
      try {
        const res = await fetch("/api/admin/services");
        const data = await res.json();
        if (data.services && Array.isArray(data.services)) {
          const activeServices = data.services
            .filter((s: any) => s.status === "ACTIVE" && !s.isDeleted)
            .map((s: any) => s.title);
          if (activeServices.length > 0) {
            setServiceOptions([...activeServices, OTHER_SERVICE_OPTION]);
          }
        }
      } catch (err) {
        console.error("Failed to load active services for contact form:", err);
      }
    }
    fetchActiveServices();
  }, []);

  // Today's date in YYYY-MM-DD for datepicker minimum value
  const [minDate, setMinDate] = useState("");
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setMinDate(today);
  }, []);

  const [selectedServices, setSelectedServices] = useState<string[]>(
    preselectedService ? [preselectedService] : []
  );
  const [isDdlOpen, setIsDdlOpen] = useState(false);
  const ddlRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ddlRef.current && !ddlRef.current.contains(event.target as Node)) {
        setIsDdlOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    service: preselectedService || "",
    preferredDate: "",
    preferredTime: "",
    message: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState("");
  const [copiedAddress, setCopiedAddress] = useState(false);

  const handleCopyAddress = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText("Radiant Autism & Skill Center, Main Healthcare Boulevard, Suite 400, Ontario, Canada");
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2200);
    }
  };

  useEffect(() => {
    if (preselectedService) {
      setSelectedServices([preselectedService]);
      setFormData((prev) => ({ ...prev, service: preselectedService }));
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.service;
        return copy;
      });
    }
  }, [preselectedService]);

  const toggleService = (svcName: string) => {
    setSelectedServices((prev) => {
      let updated: string[];
      if (svcName.startsWith("Other")) {
        // If clicking Other / Not Decided Yet, either toggle it or select it
        updated = prev.includes(svcName) ? [] : [svcName];
      } else {
        // If selecting a clinical service, remove "Other / Not Decided Yet"
        const filtered = prev.filter((s) => !s.startsWith("Other"));
        if (filtered.includes(svcName)) {
          updated = filtered.filter((s) => s !== svcName);
        } else {
          updated = [...filtered, svcName];
        }
      }

      const joined = updated.join(", ");
      setFormData((f) => ({ ...f, service: joined }));

      if (updated.length > 0) {
        setErrors((errs) => {
          const c = { ...errs };
          delete c.service;
          return c;
        });
      }
      return updated;
    });
  };

  const scrollToCard = () => {
    setTimeout(() => {
      formCardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  // Modern Inline Form Validation
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // 1. Full Name
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Please enter parent or guardian's full name.";
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Name must be at least 2 characters.";
    }

    // 2. Email Address
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Please enter your email address.";
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email format (e.g. name@example.com).";
    }

    // 3. Phone / Mobile (Optional, but if filled, must have valid length/digits)
    if (formData.phone.trim()) {
      const phoneDigits = formData.phone.replace(/[\s\-\(\)\.]/g, "");
      if (phoneDigits.length < 7 || !/^\+?\d+$/.test(phoneDigits)) {
        newErrors.phone = "Please enter a valid phone number (minimum 7 digits).";
      }
    }

    // 4. Clinical Service
    if (selectedServices.length === 0 && !formData.service.trim()) {
      newErrors.service = "Please select at least one service or choose 'Other / Not Decided Yet'.";
    }

    // 5. Calendar Date
    if (!formData.preferredDate) {
      newErrors.preferredDate = "Please choose a preferred appointment date.";
    } else if (minDate && formData.preferredDate < minDate) {
      newErrors.preferredDate = "Appointment date cannot be in the past.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear inline error on change
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      scrollToCard();
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setTicketId(data.ticketId || `RAC-${Math.floor(10000 + Math.random() * 90000)}`);
        setSubmitted(true);
        scrollToCard();
      } else {
        alert(data.error || "Failed to submit request. Please try again.");
      }
    } catch (err) {
      console.error("Submission error:", err);
      // Fallback ticket generation if offline or demo mode
      setTicketId(`RAC-${Math.floor(10000 + Math.random() * 90000)}`);
      setSubmitted(true);
      scrollToCard();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setSubmitted(false);
    setErrors({});
    setSelectedServices([]);
    setIsDdlOpen(false);
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      service: "",
      preferredDate: "",
      preferredTime: "",
      message: "",
    });
  };

  return (
    <section className="py-16 md:py-24 bg-slate-50 relative overflow-hidden select-none border-t border-slate-200/80" id="inquiry-form">
      {/* Soft Light Ambient Glows & Dot Grid Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute -top-32 -left-32 w-[550px] h-[550px] bg-sky-200/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-[550px] h-[550px] bg-indigo-100/50 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-amber-100/30 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:28px_28px] opacity-40" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Contact Cards & Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-extrabold uppercase tracking-wider shadow-2xs">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <span>Get In Touch With Our Care Team</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              We Are Here To Guide Your Child’s Journey
            </h2>

            <p className="text-slate-600 text-base leading-relaxed font-medium">
              Have questions about our OAP covered services, RBA supervision, or appointment scheduling? Book an appointment or call our care staff today.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-4 p-4.5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:border-blue-400 transition-all">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 font-bold">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">Call Line</h4>
                  <a href="tel:+18005557890" className="text-xs text-blue-600 font-bold hover:underline">
                    +1 (800) 555-RADIANT
                  </a>
                  <p className="text-xs text-slate-500 mt-0.5">Instant phone consultation</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4.5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:border-blue-400 transition-all">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">Email Inquiry</h4>
                  <a href="mailto:care@radiantautism.com" className="text-xs text-blue-600 font-bold hover:underline">
                    care@radiantautism.com
                  </a>
                  <p className="text-xs text-slate-500 mt-0.5">24-hour response time</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4.5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:border-blue-400 transition-all">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 font-bold">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">Center Location</h4>
                  <p className="text-xs text-slate-700 font-medium">
                    Radiant Autism & Skill Center, Main Healthcare Boulevard, Suite 400
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Ontario, Canada • Mon-Sat: 8:00 AM - 6:00 PM</p>
                </div>
              </div>

              {/* High-Resolution Interactive Clinical Map */}
              <div className="rounded-2xl overflow-hidden border-2 border-slate-200/90 shadow-lg relative bg-slate-950 group">
                {/* Floating Top Left Clinic Status Badge */}
                <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md border border-slate-200/80">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs font-extrabold text-slate-900 tracking-tight">Radiant Autism Center</span>
                </div>

                {/* Floating Top Right Directions Button */}
                <a
                  href="https://www.google.com/maps/dir/?api=1&destination=43.6570,-79.3870"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-3 right-3 z-10 bg-white/95 backdrop-blur-md hover:bg-white text-blue-600 font-extrabold text-xs px-3 py-1.5 rounded-full shadow-md border border-slate-200/80 flex items-center gap-1.5 transition-all hover:scale-105"
                  title="Get Directions on Google Maps"
                >
                  <Navigation className="w-3.5 h-3.5 text-blue-600" />
                  <span>Directions</span>
                </a>

                {/* Detailed Ontario Healthcare District Google Map */}
                <iframe
                  title="Radiant Autism Center Location Map"
                  src="https://maps.google.com/maps?q=43.6570,-79.3870&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  className="w-full h-[250px] sm:h-[270px] border-0 filter contrast-[1.05]"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />

                {/* Card Footer Bar */}
                <div className="p-3.5 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-100 text-xs">Main Healthcare Blvd, Suite 400</p>
                      <p className="text-[11px] text-slate-400">Ontario, Canada • Free Dedicated Parking</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleCopyAddress}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-[11px] transition-colors flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                    >
                      {copiedAddress ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-300 font-bold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-300" />
                          <span>Copy Address</span>
                        </>
                      )}
                    </button>
                    <a
                      href="https://www.google.com/maps/search/?api=1&query=43.6570,-79.3870"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <span>Open Maps</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: 6-Field Appointment & Booking Form with Robust Validation */}
          <div className="lg:col-span-7">
            <div ref={formCardRef} className="bg-white text-slate-900 rounded-3xl p-6 sm:p-10 border-2 border-slate-200/90 shadow-xl relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-100/50 rounded-full blur-2xl pointer-events-none" />

              {submitted ? (
                /* Animated Premium Success Screen */
                <div className="text-center py-8 px-4 space-y-6 animate-fadeIn select-none">
                  <div className="relative inline-block">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/30 ring-8 ring-emerald-100 animate-bounce">
                      <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 uppercase tracking-wider shadow-2xs">
                      Appointment Request Received
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      Thank You, {formData.fullName || "Valued Parent"}!
                    </h3>
                    <p className="text-slate-600 text-xs sm:text-sm max-w-md mx-auto font-medium leading-relaxed">
                      Our clinical care coordinator will review your preferred schedule and confirm your appointment within 1 business day.
                    </p>
                  </div>

                  {/* Clean Appointment Summary Box */}
                  <div className="bg-slate-50 border-2 border-blue-200/80 rounded-2xl p-5 max-w-md mx-auto shadow-sm space-y-3 text-left">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                      <span className="font-extrabold text-slate-600 text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-blue-600" />
                        Booking Reference
                      </span>
                      <span className="font-black text-blue-700 text-sm font-mono bg-white px-3 py-1 rounded-xl border border-blue-200 shadow-xs">
                        #{ticketId}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-500 font-semibold block">Selected Program:</span>
                        <span className="font-bold text-slate-800">{formData.service}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-semibold block">Preferred Date:</span>
                        <span className="font-bold text-slate-800">{formData.preferredDate}</span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-slate-500 font-semibold block">Prefer Time to Reach (EST):</span>
                        <span className="font-bold text-slate-800">{formData.preferredTime ? `${formData.preferredTime} EST` : "Flexible / First Available"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-center">
                    <button
                      onClick={handleResetForm}
                      type="button"
                      className="px-7 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4 text-sky-400" />
                      <span>Book Another Appointment</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* 6-Field Booking Form with Visible Inline Error Highlighting */
                <form onSubmit={handleSubmit} noValidate className="space-y-4 sm:space-y-5">
                  <div className="space-y-1">
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                      Book an Appointment
                    </h3>
                    <p className="text-slate-600 text-xs font-semibold leading-relaxed">
                      Please enter your contact details and preferred date. Our clinical staff will confirm promptly.
                    </p>
                  </div>

                  {/* Field 1: Full Name (Parent / Guardian) */}
                  <div className="space-y-1">
                    <div className="relative pt-2">
                      <input
                        type="text"
                        id="fullName"
                        placeholder=" "
                        value={formData.fullName}
                        onChange={(e) => handleChange("fullName", e.target.value)}
                        className={`peer w-full px-4 py-3.5 rounded-2xl border transition-all text-sm font-bold text-slate-800 outline-none bg-white placeholder-transparent ${
                          errors.fullName
                            ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/15"
                            : "border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15"
                        }`}
                      />
                      <label
                        htmlFor="fullName"
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-semibold transition-all duration-200 pointer-events-none peer-focus:top-0 peer-focus:translate-y-0 peer-focus:text-[11px] peer-focus:font-extrabold peer-focus:text-blue-600 peer-focus:bg-white peer-focus:px-1.5 peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:font-extrabold peer-[:not(:placeholder-shown)]:text-blue-700 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1.5 flex items-center gap-1"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>Parent / Guardian Full Name <span className="text-red-500">*</span></span>
                      </label>
                    </div>
                    {errors.fullName && (
                      <p className="text-red-600 text-xs font-bold pl-2 flex items-center gap-1 animate-fadeIn">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.fullName}</span>
                      </p>
                    )}
                  </div>

                  {/* Field 2 & Field 3: Email ID & Mobile Number */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Email Field */}
                    <div className="space-y-1">
                      <div className="relative pt-2">
                        <input
                          type="email"
                          id="email"
                          placeholder=" "
                          value={formData.email}
                          onChange={(e) => handleChange("email", e.target.value)}
                          className={`peer w-full px-4 py-3.5 rounded-2xl border transition-all text-sm font-bold text-slate-800 outline-none bg-white placeholder-transparent ${
                            errors.email
                              ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/15"
                              : "border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15"
                          }`}
                        />
                        <label
                          htmlFor="email"
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-semibold transition-all duration-200 pointer-events-none peer-focus:top-0 peer-focus:translate-y-0 peer-focus:text-[11px] peer-focus:font-extrabold peer-focus:text-blue-600 peer-focus:bg-white peer-focus:px-1.5 peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:font-extrabold peer-[:not(:placeholder-shown)]:text-blue-700 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1.5 flex items-center gap-1"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Email Address <span className="text-red-500">*</span></span>
                        </label>
                      </div>
                      {errors.email && (
                        <p className="text-red-600 text-xs font-bold pl-2 flex items-center gap-1 animate-fadeIn">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{errors.email}</span>
                        </p>
                      )}
                    </div>

                    {/* Mobile Field (Optional) */}
                    <div className="space-y-1">
                      <div className="relative pt-2">
                        <input
                          type="tel"
                          id="phone"
                          placeholder=" "
                          value={formData.phone}
                          onChange={(e) => handleChange("phone", e.target.value)}
                          className={`peer w-full px-4 py-3.5 rounded-2xl border transition-all text-sm font-bold text-slate-800 outline-none bg-white placeholder-transparent ${
                            errors.phone
                              ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/15"
                              : "border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15"
                          }`}
                        />
                        <label
                          htmlFor="phone"
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-semibold transition-all duration-200 pointer-events-none peer-focus:top-0 peer-focus:translate-y-0 peer-focus:text-[11px] peer-focus:font-extrabold peer-focus:text-blue-600 peer-focus:bg-white peer-focus:px-1.5 peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:font-extrabold peer-[:not(:placeholder-shown)]:text-blue-700 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1.5 flex items-center gap-1"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Phone</span>
                        </label>
                      </div>
                      {errors.phone && (
                        <p className="text-red-600 text-xs font-bold pl-2 flex items-center gap-1 animate-fadeIn">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{errors.phone}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Field 4: Interested Service (Multi-Select DDL Dropdown with Checkboxes) */}
                  <div className="space-y-1">
                    <div ref={ddlRef} className="relative pt-2">
                      <button
                        type="button"
                        id="service-ddl-btn"
                        aria-haspopup="listbox"
                        aria-expanded={isDdlOpen}
                        onClick={() => setIsDdlOpen((prev) => !prev)}
                        className={`w-full min-h-[52px] px-4 py-3.5 rounded-2xl border transition-all outline-none bg-white text-left flex items-center justify-between gap-2 cursor-pointer ${
                          errors.service
                            ? "border-red-500 focus:ring-4 focus:ring-red-500/15"
                            : isDdlOpen
                            ? "border-blue-600 ring-4 ring-blue-600/15"
                            : "border-slate-300 hover:border-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15"
                        }`}
                      >
                        <div className="flex-1 truncate pr-2">
                          {selectedServices.length === 0 ? (
                            isDdlOpen ? (
                              <span className="text-slate-400 text-sm font-medium animate-fadeIn">
                                Select services from dropdown...
                              </span>
                            ) : null
                          ) : selectedServices.length === 1 ? (
                            <span className="text-slate-800 text-sm font-bold truncate block">
                              {selectedServices[0]}
                            </span>
                          ) : (
                            <div className="flex items-center gap-1.5 truncate">
                              <span className="text-slate-800 text-xs sm:text-sm font-bold truncate">
                                {selectedServices[0]}
                              </span>
                              <span className="text-[11px] font-black bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full shrink-0">
                                +{selectedServices.length - 1} more
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {selectedServices.length > 0 && (
                            <span className="hidden sm:inline-flex text-[11px] font-black bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full">
                              {selectedServices.length} selected
                            </span>
                          )}
                          <ChevronDown
                            className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                              isDdlOpen ? "rotate-180 text-blue-600" : ""
                            }`}
                          />
                        </div>
                      </button>

                      {/* Floating Label */}
                      <label
                        onClick={() => setIsDdlOpen((prev) => !prev)}
                        className={`absolute left-4 cursor-pointer transition-all duration-200 select-none ${
                          isDdlOpen || selectedServices.length > 0
                            ? "top-0 translate-y-0 text-[11px] font-extrabold text-blue-600 bg-white px-1.5 z-10"
                            : "top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 pointer-events-none"
                        }`}
                      >
                        Service Interested In <span className="text-red-500">*</span>
                      </label>

                      {/* DDL Dropdown List Popover */}
                      {isDdlOpen && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border-2 border-slate-200/95 shadow-2xl z-50 overflow-hidden animate-fadeIn">
                          {/* Header */}
                          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between text-xs">
                            <span className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                              Select One or More Services
                            </span>
                            {selectedServices.length > 0 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedServices([]);
                                  setFormData((f) => ({ ...f, service: "" }));
                                }}
                                className="text-red-600 hover:text-red-700 font-extrabold text-[11px] hover:underline cursor-pointer"
                              >
                                Clear All ({selectedServices.length})
                              </button>
                            )}
                          </div>

                          {/* Options List with Checkboxes (Dynamic Active Services + Other) */}
                          <div className="p-1.5 space-y-1">
                            {serviceOptions.map((svc) => {
                              const isChecked = selectedServices.includes(svc);
                              const isOther = svc.startsWith("Other");
                              return (
                                <div
                                  key={svc}
                                  onClick={() => toggleService(svc)}
                                  className={`p-2.5 rounded-xl cursor-pointer flex items-center gap-3 transition-colors select-none ${
                                    isChecked
                                      ? "bg-blue-50/90 text-blue-950 font-bold border border-blue-200/80"
                                      : "hover:bg-slate-50 text-slate-700 font-medium border border-transparent"
                                  } ${isOther ? "mt-1.5 bg-amber-50/50 hover:bg-amber-50 border-amber-200/60" : ""}`}
                                >
                                  <div
                                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${
                                      isChecked
                                        ? "bg-blue-600 border-blue-600 text-white"
                                        : "border-slate-300 bg-white"
                                    }`}
                                  >
                                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                                  </div>
                                  <span className="text-xs leading-snug flex-1">
                                    {svc}
                                  </span>
                                  {isOther && (
                                    <span className="text-[10px] font-extrabold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md shrink-0">
                                      Assessment
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Footer with Prominent Done button */}
                          <div className="p-3 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-600 pl-1">
                              {selectedServices.length === 0
                                ? "No service selected"
                                : `${selectedServices.length} service${selectedServices.length > 1 ? "s" : ""} selected`}
                            </span>
                            <button
                              type="button"
                              onClick={() => setIsDdlOpen(false)}
                              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold cursor-pointer transition-all shadow-sm flex items-center gap-1.5"
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>Done</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {errors.service && (
                      <p className="text-red-600 text-xs font-bold pl-2 flex items-center gap-1 animate-fadeIn">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.service}</span>
                      </p>
                    )}
                  </div>

                  {/* Field 5: Calendar Date & Preferred Time to Reach (EST) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Calendar Date Picker */}
                    <div className="space-y-1">
                      <div className="relative pt-2">
                        <input
                          type="date"
                          id="preferredDate"
                          min={minDate}
                          value={formData.preferredDate}
                          onChange={(e) => handleChange("preferredDate", e.target.value)}
                          className={`w-full px-4 py-3.5 rounded-2xl border transition-all text-sm font-bold text-slate-800 outline-none bg-white cursor-pointer ${
                            errors.preferredDate
                              ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/15"
                              : "border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15"
                          }`}
                        />
                        <label
                          htmlFor="preferredDate"
                          className="absolute left-4 top-0 translate-y-0 text-[11px] font-extrabold text-blue-600 bg-white px-1.5 flex items-center gap-1"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Calendar Date <span className="text-red-500">*</span></span>
                        </label>
                      </div>
                      {errors.preferredDate && (
                        <p className="text-red-600 text-xs font-bold pl-2 flex items-center gap-1 animate-fadeIn">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{errors.preferredDate}</span>
                        </p>
                      )}
                    </div>

                    {/* Preferred Time to Reach (EST) Picker */}
                    <div className="space-y-1">
                      <div className="relative pt-2">
                        <input
                          type="time"
                          id="preferredTime"
                          value={formData.preferredTime}
                          onChange={(e) => handleChange("preferredTime", e.target.value)}
                          className="w-full px-4 py-3.5 rounded-2xl border border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15 bg-white text-sm font-bold text-slate-800 outline-none transition-all cursor-pointer"
                        />
                        <label
                          htmlFor="preferredTime"
                          className="absolute left-4 top-0 translate-y-0 text-[11px] font-extrabold text-blue-600 bg-white px-1.5 flex items-center gap-1"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Prefer Time to Reach (EST)</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Field 6: Additional Message / Notes (Optional) */}
                  <div className="relative pt-2">
                    <textarea
                      id="message"
                      rows={3}
                      placeholder=" "
                      value={formData.message}
                      onChange={(e) => handleChange("message", e.target.value)}
                      className="peer w-full px-4 py-3 rounded-2xl border border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15 bg-white text-sm font-bold text-slate-800 outline-none transition-all placeholder-transparent resize-none"
                    />
                    <label
                      htmlFor="message"
                      className="absolute left-4 top-5 text-slate-500 text-xs font-semibold transition-all duration-200 pointer-events-none peer-focus:top-0 peer-focus:translate-y-0 peer-focus:text-[11px] peer-focus:font-extrabold peer-focus:text-blue-600 peer-focus:bg-white peer-focus:px-1.5 peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:font-extrabold peer-[:not(:placeholder-shown)]:text-blue-700 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1.5"
                    >
                      Additional Message / Details (Optional)
                    </label>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 transition-all flex items-center justify-center gap-2 group cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Booking Appointment...</span>
                        </>
                      ) : (
                        <>
                          <Calendar className="w-4.5 h-4.5" />
                          <span>Confirm & Book Appointment</span>
                          <Send className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
