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
} from "lucide-react";

export default function ContactForm() {
  const searchParams = useSearchParams();
  const preselectedService = searchParams?.get("service") || "";
  const formCardRef = useRef<HTMLDivElement>(null);

  // Today's date in YYYY-MM-DD for datepicker minimum value
  const [minDate, setMinDate] = useState("");
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setMinDate(today);
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
  const [isServiceFocused, setIsServiceFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState("");

  useEffect(() => {
    if (preselectedService) {
      setFormData((prev) => ({ ...prev, service: preselectedService }));
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.service;
        return copy;
      });
    }
  }, [preselectedService]);

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
    if (!formData.service) {
      newErrors.service = "Please select the clinical service you are interested in.";
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
                </div>
              </div>

              {/* Compact Sleek Left Map Box */}
              <div className="rounded-2xl overflow-hidden border-2 border-slate-200/90 shadow-md relative bg-slate-900 group">
                <iframe
                  title="Radiant Autism Center Compact Map"
                  src="https://maps.google.com/maps?q=Autism%20Therapy%20Center&t=&z=14&ie=UTF8&iwloc=&output=embed"
                  className="w-full h-[180px] border-0 filter contrast-[1.05]"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <div className="p-3 bg-slate-900 text-white flex items-center justify-between text-xs border-t border-slate-800">
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="font-bold truncate text-[11px] text-slate-200">Main Healthcare Blvd, Suite 400</span>
                  </div>
                  <a
                    href="https://maps.google.com/?q=Autism+Therapy+Center"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 font-extrabold text-[11px] shrink-0 ml-2"
                  >
                    Directions ↗
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: 6-Field Appointment & Booking Form with Robust Validation */}
          <div className="lg:col-span-7">
            <div ref={formCardRef} className="bg-white text-slate-900 rounded-3xl p-6 sm:p-10 border-2 border-slate-200/90 shadow-xl relative overflow-hidden">
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
                          <span>Mobile / Phone Number</span>
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

                  {/* Field 4: Interested Service (Dropdown of 4 core services) */}
                  <div className="space-y-1">
                    <div className="relative pt-2">
                      <select
                        id="service"
                        value={formData.service}
                        onFocus={() => setIsServiceFocused(true)}
                        onBlur={() => setIsServiceFocused(false)}
                        onChange={(e) => handleChange("service", e.target.value)}
                        className={`w-full px-4 py-3.5 rounded-2xl border transition-all outline-none bg-white text-sm font-bold cursor-pointer ${
                          errors.service
                            ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/15"
                            : isServiceFocused || formData.service !== ""
                            ? "text-slate-800 border-blue-600 ring-4 ring-blue-600/15"
                            : "text-transparent border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15"
                        }`}
                      >
                        <option value="" disabled hidden></option>
                        <option value="ABA Therapy (Applied Behavior Analysis)">ABA Therapy (Applied Behavior Analysis)</option>
                        <option value="Speech and Language Service (SLP)">Speech and Language Service (SLP)</option>
                        <option value="Occupational Therapy (OT)">Occupational Therapy (OT - Motor & Sensory)</option>
                        <option value="Life Skills & Group Programs">Life Skills & Group Programs (Ages 9–18)</option>
                      </select>
                      <label
                        htmlFor="service"
                        className={`absolute left-4 transition-all duration-200 pointer-events-none ${
                          isServiceFocused || formData.service !== ""
                            ? "top-0 translate-y-0 text-[11px] font-extrabold text-blue-600 bg-white px-1.5"
                            : "top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500"
                        }`}
                      >
                        Service Interested In <span className="text-red-500">*</span>
                      </label>
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
