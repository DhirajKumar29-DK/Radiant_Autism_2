"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Brain,
  Plus,
  Edit3,
  Trash2,
  ExternalLink,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  X,
  Save,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  ListCheck,
  Award,
  Layers,
  Clock,
  Users,
  Info,
  Calendar,
} from "lucide-react";
import AdminPagination from "@/components/common/AdminPagination";
import ConfirmModal from "@/components/common/ConfirmModal";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { SERVICES_DATA } from "@/data/servicesData";

type StatusType = "ACTIVE" | "INACTIVE" | "DRAFT";

interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  tagline?: string | null;
  badge?: string | null;
  badgeBg?: string | null;
  iconBg?: string | null;
  bulletColor?: string | null;
  iconName?: string | null;
  image?: string | null;
  shortDescription?: string | null;
  overviewParagraphs?: string | null;
  ageGroup?: string | null;
  sessionFormat?: string | null;
  duration?: string | null;
  clinicalLead?: string | null;
  features?: string | null;
  whoNeedsThis?: string | null;
  keyBenefits?: string | null;
  faqs?: string | null;
  status: StatusType;
  isActive: boolean;
  order: number;
  updatedAt?: string;
  createdAt?: string;
}

interface BenefitCard {
  title: string;
  description: string;
}

interface FaqPair {
  question: string;
  answer: string;
}

type TabType = "general" | "overview" | "checklist" | "benefits" | "faqs";

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalMode, setModalMode] = useState<"ADD" | "EDIT" | null>(null);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("general");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Search
  const [searchQuery, setSearchQuery] = useState("");

  // Selection & Bulk Action
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [deleteTargetIds, setDeleteTargetIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    tagline: "",
    badge: "Communication Care",
    badgeBg: "bg-blue-600",
    iconName: "Brain",
    image: "/hero_speech_therapy.jpg",
    shortDescription: "",
    overviewText: "",
    features: ["", "", ""],
    ageGroup: "Toddler to Youth",
    sessionFormat: "1:1 Clinical Sessions",
    duration: "45 to 60 Min Sessions",
    clinicalLead: "Registered Clinical Specialist",
    checklistSubtitle: "This therapy is recommended if your child demonstrates:",
    checklistSigns: [
      "Needs support with communication and developmental milestones",
      "Struggles to express wants, needs, or thoughts comfortably",
      "Noticeable difficulty in daily routines or emotional regulation",
      "Benefits from individualized, data-backed 1:1 clinical guidance",
    ],
    keyBenefits: [
      {
        title: "Targeted Developmental Growth",
        description: "Evidence-based therapy tailored specifically to socially significant goals.",
      },
      {
        title: "1:1 Registered Clinical Supervision",
        description: "Direct program design and continuous data analysis by licensed clinicians.",
      },
      {
        title: "Family-Centered Coaching",
        description: "Practical carryover strategies empowering parents to support progress at home.",
      },
      {
        title: "OAP Funding Eligible",
        description: "100% covered under Core Clinical Services of the Ontario Autism Program.",
      },
    ] as BenefitCard[],
    faqs: [
      {
        question: "What age group is eligible for this therapy?",
        answer: "We support children from toddlers (as young as 18 months) through school-age youth and teens.",
      },
      {
        question: "Is this service covered by the Ontario Autism Program (OAP)?",
        answer: "Yes, our clinical therapies are fully eligible under OAP Core Clinical Services funding.",
      },
    ] as FaqPair[],
    status: "ACTIVE" as StatusType,
    order: 0,
  });

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/services");
      if (res.ok) {
        const data = await res.json();
        const mapped: ServiceItem[] = (data.services || []).map((s: any) => ({
          ...s,
          status: (s.status as StatusType) || (s.isActive ? "ACTIVE" : "INACTIVE"),
        }));
        setServices(mapped);
      }
    } catch (err) {
      console.error("Failed to load services:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const openAddModal = () => {
    setFormData({
      title: "",
      slug: "",
      tagline: "",
      badge: "Clinical Care",
      badgeBg: "bg-blue-600",
      iconName: "Brain",
      image: "/hero_child_therapy.jpg",
      shortDescription: "",
      overviewText:
        "Our clinical therapy program utilizes research-backed methodologies to help children achieve critical developmental milestones in communication, daily life, and social confidence.\n\nAll programs are custom-tailored to each child's individual strengths and supervised by certified specialists.",
      features: [
        "Certified Clinical Lead",
        "Individualized Care Plan",
        "Play-Based Developmental Scaffolding",
      ],
      ageGroup: "2 to 20 Years",
      sessionFormat: "1:1 Individualized Sessions",
      duration: "45 to 60 Min Sessions",
      clinicalLead: "Registered Behaviour Analyst (RBA)",
      checklistSubtitle: "This program is recommended if your child demonstrates:",
      checklistSigns: [
        "Delays in functional communication or verbal expression",
        "Difficulty with self-regulation, transitions, or sensory processing",
        "Challenges with interactive peer play or daily living routines",
        "Benefits from evidence-based 1:1 clinical support",
      ],
      keyBenefits: [
        {
          title: "Milestone-Driven Progress",
          description: "Systematic data collection tracking communication, motor, and social skills.",
        },
        {
          title: "Licensed Clinical Leadership",
          description: "Direct program oversight ensuring child-centered, ethical care.",
        },
        {
          title: "Parent Collaborative Coaching",
          description: "Empowering families with carryover routines for home and classroom success.",
        },
        {
          title: "OAP Covered",
          description: "100% eligible for Ontario Autism Program (OAP) funding support.",
        },
      ],
      faqs: [
        {
          question: "How do we get started with this program?",
          answer: "Contact our intake team to schedule an initial clinical screening and developmental consultation.",
        },
        {
          question: "Is this program covered by OAP funding?",
          answer: "Yes, all our clinical programs are eligible under the Ontario Autism Program (OAP).",
        },
      ],
      status: "ACTIVE",
      order: services.length + 1,
    });
    setEditingService(null);
    setActiveTab("general");
    setSaveSuccess(false);
    setModalMode("ADD");
  };

  const openEditModal = (svc: ServiceItem) => {
    setEditingService(svc);
    const staticFallback = SERVICES_DATA[svc.slug] || null;

    // Overview paragraphs
    let parsedOverview = "";
    try {
      if (svc.overviewParagraphs) {
        const arr = JSON.parse(svc.overviewParagraphs);
        parsedOverview = Array.isArray(arr) ? arr.join("\n\n") : svc.overviewParagraphs;
      }
    } catch {
      parsedOverview = svc.overviewParagraphs || "";
    }
    if (!parsedOverview && staticFallback?.overviewParagraphs) {
      parsedOverview = staticFallback.overviewParagraphs.join("\n\n");
    }

    // Features / Highlights
    let parsedFeatures: string[] = ["", "", ""];
    try {
      if (svc.features) {
        const arr = JSON.parse(svc.features);
        if (Array.isArray(arr)) {
          parsedFeatures = [arr[0] || "", arr[1] || "", arr[2] || ""];
        }
      }
    } catch {}
    if (parsedFeatures.every((f) => !f) && staticFallback?.features) {
      parsedFeatures = [
        staticFallback.features[0] || "",
        staticFallback.features[1] || "",
        staticFallback.features[2] || "",
      ];
    }

    // Who needs this (Checklist)
    let parsedSubtitle = "This therapy is recommended if your child demonstrates:";
    let parsedSigns: string[] = [];
    try {
      if (svc.whoNeedsThis) {
        const obj = JSON.parse(svc.whoNeedsThis);
        if (obj?.subtitle) parsedSubtitle = obj.subtitle;
        if (Array.isArray(obj?.signs)) parsedSigns = obj.signs;
      }
    } catch {}
    if (parsedSigns.length === 0 && staticFallback?.whoNeedsThis) {
      parsedSubtitle = staticFallback.whoNeedsThis.subtitle;
      parsedSigns = staticFallback.whoNeedsThis.signs;
    }
    if (parsedSigns.length === 0) {
      parsedSigns = ["Needs individualized developmental support"];
    }

    // Key Benefits
    let parsedBenefits: BenefitCard[] = [];
    try {
      if (svc.keyBenefits) {
        const arr = JSON.parse(svc.keyBenefits);
        if (Array.isArray(arr)) parsedBenefits = arr;
      }
    } catch {}
    if (parsedBenefits.length === 0 && staticFallback?.keyBenefits) {
      parsedBenefits = staticFallback.keyBenefits;
    }

    // FAQs
    let parsedFaqs: FaqPair[] = [];
    try {
      if (svc.faqs) {
        const arr = JSON.parse(svc.faqs);
        if (Array.isArray(arr)) parsedFaqs = arr;
      }
    } catch {}
    if (parsedFaqs.length === 0 && staticFallback?.faqs) {
      parsedFaqs = staticFallback.faqs;
    }

    setFormData({
      title: svc.title,
      slug: svc.slug,
      tagline: svc.tagline || staticFallback?.tagline || "",
      badge: svc.badge || staticFallback?.badge || "Clinical Care",
      badgeBg: svc.badgeBg || staticFallback?.badgeBg || "bg-blue-600",
      iconName: svc.iconName || staticFallback?.iconName || "Brain",
      image: svc.image || staticFallback?.image || "/hero_child_therapy.jpg",
      shortDescription: svc.shortDescription || staticFallback?.shortDescription || "",
      overviewText: parsedOverview,
      features: parsedFeatures,
      ageGroup: svc.ageGroup || staticFallback?.ageGroup || "All Ages",
      sessionFormat: svc.sessionFormat || staticFallback?.sessionFormat || "1:1 Focused Sessions",
      duration: svc.duration || staticFallback?.duration || "45–60 Minutes per session",
      clinicalLead: svc.clinicalLead || staticFallback?.clinicalLead || "",
      checklistSubtitle: parsedSubtitle,
      checklistSigns: parsedSigns,
      keyBenefits: parsedBenefits.length > 0 ? parsedBenefits : [{ title: "", description: "" }],
      faqs: parsedFaqs.length > 0 ? parsedFaqs : [{ question: "", answer: "" }],
      status: svc.status || (svc.isActive ? "ACTIVE" : "INACTIVE"),
      order: svc.order || 0,
    });

    setActiveTab("general");
    setSaveSuccess(false);
    setModalMode("EDIT");
  };

  // Checklist Helpers
  const addChecklistSign = () => {
    setFormData((prev) => ({
      ...prev,
      checklistSigns: [...prev.checklistSigns, ""],
    }));
  };
  const removeChecklistSign = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      checklistSigns: prev.checklistSigns.filter((_, i) => i !== index),
    }));
  };
  const updateChecklistSign = (index: number, val: string) => {
    setFormData((prev) => {
      const copy = [...prev.checklistSigns];
      copy[index] = val;
      return { ...prev, checklistSigns: copy };
    });
  };

  // Benefits Helpers
  const addBenefitCard = () => {
    setFormData((prev) => ({
      ...prev,
      keyBenefits: [...prev.keyBenefits, { title: "", description: "" }],
    }));
  };
  const removeBenefitCard = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      keyBenefits: prev.keyBenefits.filter((_, i) => i !== index),
    }));
  };
  const updateBenefitCard = (index: number, field: "title" | "description", val: string) => {
    setFormData((prev) => {
      const copy = [...prev.keyBenefits];
      copy[index] = { ...copy[index], [field]: val };
      return { ...prev, keyBenefits: copy };
    });
  };

  // FAQ Helpers
  const addFaq = () => {
    setFormData((prev) => ({
      ...prev,
      faqs: [...prev.faqs, { question: "", answer: "" }],
    }));
  };
  const removeFaq = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index),
    }));
  };
  const updateFaq = (index: number, field: "question" | "answer", val: string) => {
    setFormData((prev) => {
      const copy = [...prev.faqs];
      copy[index] = { ...copy[index], [field]: val };
      return { ...prev, faqs: copy };
    });
  };

  // Filter & Search
  const filteredServices = useMemo(() => {
    if (!searchQuery.trim()) return services;
    const q = searchQuery.toLowerCase();
    return services.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.slug.toLowerCase().includes(q) ||
        (s.clinicalLead && s.clinicalLead.toLowerCase().includes(q)) ||
        (s.badge && s.badge.toLowerCase().includes(q))
    );
  }, [services, searchQuery]);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
  const paginatedServices = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredServices.slice(start, start + itemsPerPage);
  }, [filteredServices, currentPage, itemsPerPage]);

  // Selection handlers
  const toggleSelectAll = () => {
    if (paginatedServices.length > 0 && paginatedServices.every((s) => selectedIds.includes(s.id))) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedServices.map((s) => s.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Quick cycle status
  const cycleStatus = async (svc: ServiceItem) => {
    const nextStatus: StatusType =
      svc.status === "ACTIVE" ? "INACTIVE" : svc.status === "INACTIVE" ? "DRAFT" : "ACTIVE";

    try {
      const res = await fetch(`/api/admin/services/${svc.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setServices((prev) =>
          prev.map((s) =>
            s.id === svc.id ? { ...s, status: nextStatus, isActive: nextStatus === "ACTIVE" } : s
          )
        );
      }
    } catch (err) {
      console.error("Status toggle error:", err);
    }
  };

  // Delete handlers
  const confirmSingleDelete = (id: string) => {
    setDeleteTargetIds([id]);
    setIsConfirmDeleteOpen(true);
  };

  const confirmBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setDeleteTargetIds(selectedIds);
    setIsConfirmDeleteOpen(true);
  };

  const executeDelete = async () => {
    if (deleteTargetIds.length === 0) return;
    setIsDeleting(true);

    try {
      if (deleteTargetIds.length === 1) {
        const id = deleteTargetIds[0];
        const res = await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
        if (res.ok) {
          setServices((prev) => prev.filter((item) => item.id !== id));
          setSelectedIds((prev) => prev.filter((item) => item !== id));
        }
      } else {
        const res = await fetch("/api/admin/services", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: deleteTargetIds }),
        });
        if (res.ok) {
          setServices((prev) => prev.filter((item) => !deleteTargetIds.includes(item.id)));
          setSelectedIds([]);
        }
      }
      setIsConfirmDeleteOpen(false);
      setDeleteTargetIds([]);
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting service(s)");
    } finally {
      setIsDeleting(false);
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSaveSuccess(false);

    try {
      const payload = {
        title: formData.title,
        slug: formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]/g, "-"),
        tagline: formData.tagline,
        badge: formData.badge,
        clinicalLead: formData.clinicalLead,
        ageGroup: formData.ageGroup,
        sessionFormat: formData.sessionFormat,
        duration: formData.duration,
        image: formData.image,
        shortDescription: formData.shortDescription || formData.tagline,
        overviewParagraphs: formData.overviewText
          .split("\n\n")
          .map((p) => p.trim())
          .filter(Boolean),
        features: formData.features.map((f) => f.trim()).filter(Boolean),
        whoNeedsThis: {
          subtitle: formData.checklistSubtitle,
          signs: formData.checklistSigns.map((s) => s.trim()).filter(Boolean),
        },
        keyBenefits: formData.keyBenefits.filter((b) => b.title.trim()),
        faqs: formData.faqs.filter((f) => f.question.trim()),
        status: formData.status,
        order: Number(formData.order) || 0,
      };

      if (modalMode === "ADD") {
        const res = await fetch("/api/admin/services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          setSaveSuccess(true);
          await fetchServices();
          setTimeout(() => {
            setModalMode(null);
            setSaveSuccess(false);
          }, 1000);
        } else {
          const errData = await res.json();
          alert(errData.error || "Failed to create program");
        }
      } else if (modalMode === "EDIT" && editingService) {
        const res = await fetch(`/api/admin/services/${editingService.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          setSaveSuccess(true);
          await fetchServices();
          setTimeout(() => {
            setModalMode(null);
            setSaveSuccess(false);
          }, 1000);
        } else {
          const errData = await res.json();
          alert(errData.error || "Failed to update program");
        }
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("Error saving service");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStatusBadge = (st: StatusType, svc: ServiceItem) => {
    switch (st) {
      case "ACTIVE":
        return (
          <button
            type="button"
            onClick={() => cycleStatus(svc)}
            title="Click to cycle status"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            ACTIVE
          </button>
        );
      case "INACTIVE":
        return (
          <button
            type="button"
            onClick={() => cycleStatus(svc)}
            title="Click to cycle status"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-slate-100 text-slate-600 border border-slate-300 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            INACTIVE
          </button>
        );
      case "DRAFT":
        return (
          <button
            type="button"
            onClick={() => cycleStatus(svc)}
            title="Click to cycle status"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            DRAFT
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Clinical Programs & Therapy Services
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-extrabold text-xs">
              {services.length} Programs
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Manage comprehensive clinical landing pages, parent checklists, outcomes, and FAQs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={confirmBulkDelete}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>Delete Selected ({selectedIds.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold rounded-2xl shadow-lg shadow-blue-600/30 transition-all uppercase tracking-wider cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Clinical Program</span>
          </button>
        </div>
      </div>

      {/* Main Table View */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col min-h-0 flex-1 overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">
              Loading Programs...
            </p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="bg-white p-16 rounded-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Brain className="w-7 h-7" />
            </div>
            <h3 className="text-slate-900 font-bold text-base">No Clinical Programs Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
              Create your first clinical therapy program to display full detailed landing pages.
            </p>
            <button
              type="button"
              onClick={openAddModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Add First Program
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-y-auto overflow-x-auto flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <table className="w-full text-left border-collapse min-w-[850px]">
                <thead className="sticky top-0 z-10 shadow-2xs bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-4 pl-6 pr-2 w-10 bg-slate-50">
                      <input
                        type="checkbox"
                        checked={
                          paginatedServices.length > 0 &&
                          paginatedServices.every((s) => selectedIds.includes(s.id))
                        }
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </th>
                    <th className="py-4 px-3 w-12 text-center bg-slate-50">#</th>
                    <th className="py-4 px-6 bg-slate-50">Program / Service</th>
                    <th className="py-4 px-6 bg-slate-50">Badge</th>
                    <th className="py-4 px-6 bg-slate-50">Target Age</th>
                    <th className="py-4 px-6 bg-slate-50">Supervising Lead</th>
                    <th className="py-4 px-6 bg-slate-50">Status</th>
                    <th className="py-4 px-6 text-right bg-slate-50">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {paginatedServices.map((svc, idx) => {
                    const rowNumber = (currentPage - 1) * itemsPerPage + idx + 1;
                    const isSelected = selectedIds.includes(svc.id);

                    return (
                      <tr
                        key={svc.id}
                        className={`hover:bg-slate-50/50 transition-colors ${
                          isSelected ? "bg-blue-50/30" : ""
                        }`}
                      >
                        <td className="py-4 pl-6 pr-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectOne(svc.id)}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </td>

                        <td className="py-4 px-3 font-bold text-slate-400 text-center">
                          {rowNumber}
                        </td>

                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative shrink-0">
                              <Image
                                src={svc.image || "/hero_child_therapy.jpg"}
                                alt={svc.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-extrabold text-slate-900">{svc.title}</p>
                              <Link
                                href={`/services/${svc.slug}`}
                                target="_blank"
                                className="text-[11px] text-blue-600 font-mono font-medium hover:underline inline-flex items-center gap-1"
                              >
                                <span>/services/{svc.slug}</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </Link>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <span className="inline-block px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-[11px] font-extrabold border border-blue-100">
                            {svc.badge || "Clinical Care"}
                          </span>
                        </td>

                        <td className="py-4 px-6 font-bold text-slate-700">
                          {svc.ageGroup || "All Ages"}
                        </td>

                        <td className="py-4 px-6 font-medium text-slate-600 max-w-xs">
                          <p className="line-clamp-1">{svc.clinicalLead || "Clinical Team"}</p>
                        </td>

                        {/* Status Badge */}
                        <td className="py-4 px-6">{renderStatusBadge(svc.status, svc)}</td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEditModal(svc)}
                              title="Edit & View All Sections"
                              className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200/80 transition-all inline-flex items-center gap-1.5 font-bold cursor-pointer"
                            >
                              <Edit3 className="w-4 h-4" />
                              <span className="text-[11px]">Edit</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => confirmSingleDelete(svc.id)}
                              title="Delete"
                              className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 transition-all inline-flex items-center gap-1.5 font-bold cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span className="text-[11px]">Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Bar */}
            <AdminPagination
              currentPage={currentPage}
              totalItems={filteredServices.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(newSize) => {
                setItemsPerPage(newSize);
                setCurrentPage(1);
              }}
              pageSizeOptions={[5, 10, 20, 50]}
            />
          </>
        )}
      </div>

      {/* 5-TAB SERVICE EDIT MODAL */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden flex flex-col border border-slate-100">
            {/* Modal Top Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/75">
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Brain className="w-5 h-5 text-blue-600" />
                  <span>
                    {modalMode === "ADD"
                      ? "Create New Clinical Program"
                      : `Edit Service: ${formData.title}`}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Manage hero info, clinical methodology, parent checklist, outcome cards, and FAQs.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Navigation Bar */}
            <div className="flex items-center gap-1 px-6 border-b border-slate-200 bg-slate-50 overflow-x-auto whitespace-nowrap text-xs font-extrabold">
              <button
                type="button"
                onClick={() => setActiveTab("general")}
                className={`py-3 px-3.5 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "general"
                    ? "border-blue-600 text-blue-600 bg-white"
                    : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60"
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>1. Basic & Hero</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("overview")}
                className={`py-3 px-3.5 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "overview"
                    ? "border-blue-600 text-blue-600 bg-white"
                    : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60"
                }`}
              >
                <Info className="w-4 h-4" />
                <span>2. Overview & Highlights</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("checklist")}
                className={`py-3 px-3.5 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "checklist"
                    ? "border-blue-600 text-blue-600 bg-white"
                    : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60"
                }`}
              >
                <ListCheck className="w-4 h-4" />
                <span>3. Parent Checklist</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("benefits")}
                className={`py-3 px-3.5 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "benefits"
                    ? "border-blue-600 text-blue-600 bg-white"
                    : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60"
                }`}
              >
                <Award className="w-4 h-4" />
                <span>4. Outcome Cards ({formData.keyBenefits.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("faqs")}
                className={`py-3 px-3.5 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "faqs"
                    ? "border-blue-600 text-blue-600 bg-white"
                    : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60"
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span>5. FAQs ({formData.faqs.length})</span>
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* TAB 1: BASIC & HERO INFO */}
              {activeTab === "general" && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                        Program Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => {
                          const t = e.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            title: t,
                            slug: prev.slug || t.toLowerCase().replace(/[^a-z0-9]/g, "-"),
                          }));
                        }}
                        placeholder="e.g. Speech and Language Service (SLP)"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                        URL Slug *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.slug}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, slug: e.target.value }))
                        }
                        placeholder="e.g. speech-therapy"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                        Category Badge Pill
                      </label>
                      <input
                        type="text"
                        value={formData.badge}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, badge: e.target.value }))
                        }
                        placeholder="e.g. Communication Care, OAP Covered"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                        Supervising Clinical Lead
                      </label>
                      <input
                        type="text"
                        value={formData.clinicalLead}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, clinicalLead: e.target.value }))
                        }
                        placeholder="e.g. April Adebayo (Registered SLP)"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                      1-Line Hero Tagline (Under Title)
                    </label>
                    <input
                      type="text"
                      value={formData.tagline}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, tagline: e.target.value }))
                      }
                      placeholder="e.g. Fun, effective speech & language therapy combining SLP expertise with ABA practices."
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  {/* 4 Clinical Metric Boxes */}
                  <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-3">
                    <span className="font-black text-xs uppercase tracking-wider text-slate-800 block">
                      Hero Section: 4 Quick Metric Cards
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600">Target Age</label>
                        <input
                          type="text"
                          value={formData.ageGroup}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, ageGroup: e.target.value }))
                          }
                          placeholder="e.g. Toddler to Youth"
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-medium text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600">Session Format</label>
                        <input
                          type="text"
                          value={formData.sessionFormat}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, sessionFormat: e.target.value }))
                          }
                          placeholder="e.g. 1:1 Clinical Sessions"
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-medium text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600">Session Duration</label>
                        <input
                          type="text"
                          value={formData.duration}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, duration: e.target.value }))
                          }
                          placeholder="e.g. 45 to 60 Min Sessions"
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-medium text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Cover Image */}
                  <ImageUploadField
                    label="Service Cover Media (Hero Aspect Ratio)"
                    value={formData.image}
                    onChange={(url) => setFormData((prev) => ({ ...prev, image: url }))}
                    recommendedSize="1200 x 800px"
                  />

                  {/* Order & Status */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1.5">
                      <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                        Display Order
                      </label>
                      <input
                        type="number"
                        value={formData.order}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            order: parseInt(e.target.value) || 0,
                          }))
                        }
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-slate-800 text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            status: e.target.value as StatusType,
                          }))
                        }
                        className="w-full p-3 bg-white border border-slate-300 rounded-2xl font-semibold text-slate-800 text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="INACTIVE">INACTIVE</option>
                        <option value="DRAFT">DRAFT</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: OVERVIEW & HIGHLIGHTS */}
              {activeTab === "overview" && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div className="space-y-1.5">
                    <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                      Brief Card Summary (Displayed on /services directory page)
                    </label>
                    <textarea
                      rows={2}
                      value={formData.shortDescription}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, shortDescription: e.target.value }))
                      }
                      placeholder="2-sentence engaging preview summary..."
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-slate-800 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                        Detailed Clinical Overview (Separate paragraphs with an empty line)
                      </label>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Renders as multi-paragraph clinical philosophy
                      </span>
                    </div>
                    <textarea
                      rows={6}
                      value={formData.overviewText}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, overviewText: e.target.value }))
                      }
                      placeholder="Write the clinical methodology, therapy principles, scientific approach, and parent expectations here..."
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-normal text-slate-800 text-sm leading-relaxed focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* 3 Core Highlights */}
                  <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 space-y-3">
                    <span className="font-black text-xs uppercase tracking-wider text-slate-800 block">
                      Core Program Highlights (3 Key Badges on Landing Page)
                    </span>

                    <div className="space-y-2.5">
                      {[0, 1, 2].map((idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                          <input
                            type="text"
                            value={formData.features[idx] || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormData((prev) => {
                                const copy = [...prev.features];
                                copy[idx] = val;
                                return { ...prev, features: copy };
                              });
                            }}
                            placeholder={`Highlight #${idx + 1} (e.g. Registered SLP Lead)`}
                            className="flex-1 p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: PARENT CHECKLIST (YELLOW BOX) */}
              {activeTab === "checklist" && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center gap-2 text-amber-800">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span className="font-black text-xs uppercase tracking-wider">
                        Landing Page: Parent Checklist Card (Yellow Box)
                      </span>
                    </div>
                    <p className="text-xs text-amber-900/80 font-medium leading-relaxed">
                      This checklist appears prominently on the right side of the overview section to help parents recognize whether their child would benefit from this therapy.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                      Checklist Card Subtitle
                    </label>
                    <input
                      type="text"
                      value={formData.checklistSubtitle}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, checklistSubtitle: e.target.value }))
                      }
                      placeholder="e.g. Speech Therapy is recommended if your child demonstrates:"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Dynamic Checklist Signs */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                        Checklist Signs / Red Flag Points
                      </label>
                      <button
                        type="button"
                        onClick={addChecklistSign}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Sign</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {formData.checklistSigns.map((sign, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-slate-200 text-slate-700 text-xs font-black flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <input
                            type="text"
                            value={sign}
                            onChange={(e) => updateChecklistSign(idx, e.target.value)}
                            placeholder="e.g. Limited vocabulary or delay in first words"
                            className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                          {formData.checklistSigns.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeChecklistSign(idx)}
                              className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Sign"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: OUTCOMES & BENEFITS (4 CARDS) */}
              {activeTab === "benefits" && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-slate-900 text-sm">
                        Key Clinical Outcomes & Benefits Cards
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">
                        Displayed as numbered cards (01, 02, 03, 04) under the Target Outcomes section.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addBenefitCard}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 text-white rounded-xl text-xs font-extrabold hover:bg-blue-700 transition-all shadow-sm cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Outcome Card</span>
                    </button>
                  </div>

                  <div className="space-y-3.5">
                    {formData.keyBenefits.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 space-y-2.5 relative"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-blue-600 uppercase tracking-wider">
                            Outcome Card #{idx + 1}
                          </span>
                          {formData.keyBenefits.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeBenefitCard(idx)}
                              className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove</span>
                            </button>
                          )}
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-600">Card Title</label>
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => updateBenefitCard(idx, "title", e.target.value)}
                            placeholder="e.g. Clear Articulation & Speech"
                            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-600">
                            Description
                          </label>
                          <textarea
                            rows={2}
                            value={item.description}
                            onChange={(e) => updateBenefitCard(idx, "description", e.target.value)}
                            placeholder="e.g. Enhancing sound clarity, word pronunciation, and conversational confidence."
                            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-normal text-xs text-slate-800 focus:outline-none focus:border-blue-500 leading-relaxed"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: FAQS (SAWAAL - JAWAAB) */}
              {activeTab === "faqs" && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-slate-900 text-sm">
                        Frequently Asked Questions (Parents FAQ)
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">
                        Answer common parent inquiries regarding eligibility, OAP funding, and therapy schedules.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addFaq}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 text-white rounded-xl text-xs font-extrabold hover:bg-blue-700 transition-all shadow-sm cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add FAQ</span>
                    </button>
                  </div>

                  <div className="space-y-3.5">
                    {formData.faqs.map((faq, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 space-y-2.5 relative"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-purple-600 uppercase tracking-wider flex items-center gap-1.5">
                            <HelpCircle className="w-4 h-4" />
                            <span>Question #{idx + 1}</span>
                          </span>
                          {formData.faqs.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeFaq(idx)}
                              className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove</span>
                            </button>
                          )}
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-600">Question</label>
                          <input
                            type="text"
                            value={faq.question}
                            onChange={(e) => updateFaq(idx, "question", e.target.value)}
                            placeholder="e.g. What age group is eligible for speech therapy?"
                            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-600">Answer</label>
                          <textarea
                            rows={2}
                            value={faq.answer}
                            onChange={(e) => updateFaq(idx, "answer", e.target.value)}
                            placeholder="Clear clinical answer explaining the service..."
                            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-normal text-xs text-slate-800 focus:outline-none focus:border-blue-500 leading-relaxed"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Modal Bottom Footer Bar */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between sticky bottom-0 bg-white">
                <div>
                  {saveSuccess && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4" />
                      Saved Successfully!
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setModalMode(null)}
                    className="px-5 py-2.5 rounded-2xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-600/25 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>
                          {modalMode === "ADD" ? "Publish Clinical Program" : "Save Changes"}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={executeDelete}
        title="Confirm Deletion"
        message={
          deleteTargetIds.length > 1
            ? `Are you sure you want to delete the selected ${deleteTargetIds.length} programs? Please confirm to proceed.`
            : "Are you sure you want to delete this clinical program? Please confirm to proceed."
        }
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        variant="danger"
      />
    </div>
  );
}
