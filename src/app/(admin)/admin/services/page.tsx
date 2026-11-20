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
  Compass,
  ChevronLeft,
  ChevronRight,
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
  clinicalProcess?: string | null;
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

interface ProcessStep {
  stepNumber: string;
  title: string;
  description: string;
}

interface FaqPair {
  question: string;
  answer: string;
}

type TabType = "general" | "overview" | "checklist" | "benefits" | "process" | "faqs";

const emptyForm = {
  title: "",
  slug: "",
  tagline: "",
  badge: "",
  badgeBg: "bg-blue-600",
  iconName: "Brain",
  image: "",
  shortDescription: "",
  overviewBadge: "Clinical Overview",
  overviewHeading: "Understanding Our Approach to This Therapy",
  overviewHighlightsTitle: "Core Program Highlights",
  overviewText: "",
  features: ["Ages 2 to 20 Years", "Registered Behaviour Analyst", "Target Verbal & Life Skills"] as string[],
  ageGroup: "",
  sessionFormat: "",
  duration: "",
  clinicalLead: "",
  checklistSubtitle: "",
  checklistSigns: [] as string[],
  keyBenefits: [] as BenefitCard[],
  clinicalProcess: [] as ProcessStep[],
  faqs: [] as FaqPair[],
  status: "ACTIVE" as StatusType,
  order: 0,
};

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalMode, setModalMode] = useState<"ADD" | "EDIT" | null>(null);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("general");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const tabOrder: TabType[] = ["general", "overview", "checklist", "benefits", "process", "faqs"];
  const currentTabIndex = tabOrder.indexOf(activeTab);

  const goToNextTab = () => {
    if (currentTabIndex < tabOrder.length - 1) {
      setActiveTab(tabOrder[currentTabIndex + 1]);
    }
  };

  const goToPrevTab = () => {
    if (currentTabIndex > 0) {
      setActiveTab(tabOrder[currentTabIndex - 1]);
    }
  };

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

  // Form State (100% clean, NO autofill/dummy data on Add)
  const [formData, setFormData] = useState({ ...emptyForm });

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
      ...emptyForm,
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
    let parsedOverviewBadge = "Clinical Overview";
    let parsedOverviewHeading = "Understanding Our Approach to This Therapy";
    let parsedHighlightsTitle = "Core Program Highlights";

    try {
      if (svc.overviewParagraphs) {
        const parsed = JSON.parse(svc.overviewParagraphs);
        if (Array.isArray(parsed)) {
          parsedOverview = parsed.join("\n\n");
        } else if (parsed && typeof parsed === "object") {
          if (Array.isArray(parsed.paragraphs)) {
            parsedOverview = parsed.paragraphs.join("\n\n");
          }
          if (parsed.badge) parsedOverviewBadge = parsed.badge;
          if (parsed.heading) parsedOverviewHeading = parsed.heading;
          if (parsed.highlightsTitle) parsedHighlightsTitle = parsed.highlightsTitle;
        } else {
          parsedOverview = svc.overviewParagraphs;
        }
      }
    } catch {
      parsedOverview = svc.overviewParagraphs || "";
    }
    if (!parsedOverview && staticFallback?.overviewParagraphs) {
      parsedOverview = staticFallback.overviewParagraphs.join("\n\n");
    }
    if (staticFallback?.overviewBadge && parsedOverviewBadge === "Clinical Overview") {
      parsedOverviewBadge = staticFallback.overviewBadge;
    }
    if (staticFallback?.overviewHeading && parsedOverviewHeading === "Understanding Our Approach to This Therapy") {
      parsedOverviewHeading = staticFallback.overviewHeading;
    }
    if (staticFallback?.overviewHighlightsTitle && parsedHighlightsTitle === "Core Program Highlights") {
      parsedHighlightsTitle = staticFallback.overviewHighlightsTitle;
    }

    // Features / Highlights
    let parsedFeatures: string[] = [];
    try {
      if (svc.features) {
        const arr = JSON.parse(svc.features);
        if (Array.isArray(arr)) {
          parsedFeatures = arr;
        }
      }
    } catch {}
    if (parsedFeatures.length === 0 && staticFallback?.features) {
      parsedFeatures = [...staticFallback.features];
    }
    if (parsedFeatures.length === 0) {
      parsedFeatures = ["", "", ""];
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

    // Process Steps
    let parsedProcess: ProcessStep[] = [];
    try {
      if ((svc as any).clinicalProcess) {
        const arr = JSON.parse((svc as any).clinicalProcess);
        if (Array.isArray(arr)) parsedProcess = arr;
      }
    } catch {}
    if (parsedProcess.length === 0 && staticFallback?.clinicalProcess) {
      parsedProcess = staticFallback.clinicalProcess;
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
      badge: svc.badge || staticFallback?.badge || "",
      badgeBg: svc.badgeBg || staticFallback?.badgeBg || "bg-blue-600",
      iconName: svc.iconName || staticFallback?.iconName || "Brain",
      image: svc.image || staticFallback?.image || "",
      shortDescription: svc.shortDescription || staticFallback?.shortDescription || "",
      overviewBadge: parsedOverviewBadge,
      overviewHeading: parsedOverviewHeading,
      overviewHighlightsTitle: parsedHighlightsTitle,
      overviewText: parsedOverview,
      features: parsedFeatures,
      ageGroup: svc.ageGroup || staticFallback?.ageGroup || "",
      sessionFormat: svc.sessionFormat || staticFallback?.sessionFormat || "",
      duration: svc.duration || staticFallback?.duration || "",
      clinicalLead: svc.clinicalLead || staticFallback?.clinicalLead || "",
      checklistSubtitle: parsedSubtitle,
      checklistSigns: parsedSigns,
      keyBenefits: parsedBenefits,
      clinicalProcess: parsedProcess,
      faqs: parsedFaqs,
      status: svc.status || (svc.isActive ? "ACTIVE" : "INACTIVE"),
      order: svc.order || 0,
    });

    setActiveTab("general");
    setSaveSuccess(false);
    setModalMode("EDIT");
  };

  // Highlights Helpers
  const addFeature = () => {
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, ""],
    }));
  };
  const removeFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };
  const updateFeature = (index: number, val: string) => {
    setFormData((prev) => {
      const copy = [...prev.features];
      copy[index] = val;
      return { ...prev, features: copy };
    });
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

  // Process Helpers (Step-By-Step Roadmap)
  const addProcessStep = () => {
    setFormData((prev) => {
      const nextNum = String(prev.clinicalProcess.length + 1).padStart(2, "0");
      return {
        ...prev,
        clinicalProcess: [
          ...prev.clinicalProcess,
          { stepNumber: nextNum, title: "", description: "" },
        ],
      };
    });
  };
  const removeProcessStep = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      clinicalProcess: prev.clinicalProcess.filter((_, i) => i !== index),
    }));
  };
  const updateProcessStep = (
    index: number,
    field: "stepNumber" | "title" | "description",
    val: string
  ) => {
    setFormData((prev) => {
      const copy = [...prev.clinicalProcess];
      copy[index] = { ...copy[index], [field]: val };
      return { ...prev, clinicalProcess: copy };
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
        overviewParagraphs: {
          badge: formData.overviewBadge || "Clinical Overview",
          heading: formData.overviewHeading || "Understanding Our Approach to This Therapy",
          highlightsTitle: formData.overviewHighlightsTitle || "Core Program Highlights",
          paragraphs: formData.overviewText
            .split("\n\n")
            .map((p) => p.trim())
            .filter(Boolean),
        },
        features: formData.features.map((f) => f.trim()).filter(Boolean),
        whoNeedsThis: {
          subtitle: formData.checklistSubtitle,
          signs: formData.checklistSigns.map((s) => s.trim()).filter(Boolean),
        },
        keyBenefits: formData.keyBenefits.filter((b) => b.title.trim()),
        clinicalProcess: formData.clinicalProcess.filter((p) => p.title.trim()),
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
    <div className="flex flex-col h-full min-h-0 space-y-4 max-w-7xl mx-auto w-full">
      {/* Top Header Bar */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
            <div className="overflow-y-auto overflow-x-auto flex-1 min-h-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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
                            </div>
                          </div>
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
                              className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200/80 transition-all inline-flex items-center justify-center font-bold cursor-pointer"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => confirmSingleDelete(svc.id)}
                              title="Delete"
                              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 transition-all inline-flex items-center justify-center font-bold cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
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
                {modalMode === "EDIT" && formData.slug && (
                  <Link
                    href={`/services/${formData.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-[11px] font-mono text-blue-600 hover:underline mt-1 font-semibold"
                  >
                    <span>View Live Page: /services/{formData.slug}</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Navigation Bar (Fixed Horizontal Scrolling Pills - Never Squished or Overlapping) */}
            <div className="flex items-center gap-2 px-6 py-2.5 border-b border-slate-200 bg-slate-50/90 overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:hidden shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab("general")}
                className={`shrink-0 py-2 px-3.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-extrabold ${
                  activeTab === "general"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                    : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80"
                }`}
              >
                <Layers className="w-4 h-4 shrink-0" />
                <span>1. Basic & Hero</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("overview")}
                className={`shrink-0 py-2 px-3.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-extrabold ${
                  activeTab === "overview"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                    : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80"
                }`}
              >
                <Info className="w-4 h-4 shrink-0" />
                <span>2. Overview & Highlights ({formData.features.filter(Boolean).length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("checklist")}
                className={`shrink-0 py-2 px-3.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-extrabold ${
                  activeTab === "checklist"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                    : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80"
                }`}
              >
                <ListCheck className="w-4 h-4 shrink-0" />
                <span>3. Parent Checklist</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("benefits")}
                className={`shrink-0 py-2 px-3.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-extrabold ${
                  activeTab === "benefits"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                    : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80"
                }`}
              >
                <Award className="w-4 h-4 shrink-0" />
                <span>4. Outcome Cards ({formData.keyBenefits.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("process")}
                className={`shrink-0 py-2 px-3.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-extrabold ${
                  activeTab === "process"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                    : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80"
                }`}
              >
                <Compass className="w-4 h-4 shrink-0" />
                <span>5. Step-By-Step Process ({formData.clinicalProcess.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("faqs")}
                className={`shrink-0 py-2 px-3.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-extrabold ${
                  activeTab === "faqs"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                    : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80"
                }`}
              >
                <HelpCircle className="w-4 h-4 shrink-0" />
                <span>6. FAQs & Settings ({formData.faqs.length})</span>
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSubmit} autoComplete="off" className="flex-1 overflow-y-auto p-6 space-y-6">
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
                        1-Line Hero Tagline (Under Title)
                      </label>
                      <input
                        type="text"
                        value={formData.tagline}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, tagline: e.target.value }))
                        }
                        placeholder="e.g. Evidence-based Applied Behavior Analysis for autism & developmental goals."
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* 4 Clinical Metric Boxes */}
                  <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-3">
                    <span className="font-black text-xs uppercase tracking-wider text-slate-800 block">
                      Hero Section: 4 Quick Metric Cards
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600">1. Target Age Group</label>
                        <input
                          type="text"
                          value={formData.ageGroup}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, ageGroup: e.target.value }))
                          }
                          placeholder="e.g. 2 to 20 Years"
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-medium text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600">2. Session Format</label>
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
                        <label className="text-xs font-bold text-slate-600">3. Clinical Supervision</label>
                        <input
                          type="text"
                          value={formData.clinicalLead}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, clinicalLead: e.target.value }))
                          }
                          placeholder="e.g. Jesenia Duran, RBA (Registered Behaviour Analyst)"
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-medium text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600">4. Recommended Frequency</label>
                        <input
                          type="text"
                          value={formData.duration}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, duration: e.target.value }))
                          }
                          placeholder="e.g. Customized per Individualized Care Plan"
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
                </div>
              )}

              {/* TAB 2: OVERVIEW & HIGHLIGHTS */}
              {activeTab === "overview" && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  {/* Section Badge & Main Heading */}
                  <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4 sm:p-5 space-y-4">
                    <span className="font-black text-xs uppercase tracking-wider text-blue-900 block">
                      Overview Section: Header & Badge Pill
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                          Section Badge / Pill Tag
                        </label>
                        <input
                          type="text"
                          value={formData.overviewBadge}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, overviewBadge: e.target.value }))
                          }
                          placeholder="e.g. CLINICAL OVERVIEW"
                          className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 text-sm focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                          Section Main Heading / Title
                        </label>
                        <input
                          type="text"
                          value={formData.overviewHeading}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, overviewHeading: e.target.value }))
                          }
                          placeholder="e.g. Understanding Our Approach to This Therapy"
                          className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 text-sm focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

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
                      placeholder="2-sentence engaging preview summary for directory cards..."
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-slate-800 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                        Detailed Clinical Overview (Separate paragraphs with an empty line)
                      </label>
                      <span className="text-[10px] text-slate-400 font-medium">
                        First paragraph appears with highlighted lead styling
                      </span>
                    </div>
                    <textarea
                      rows={6}
                      value={formData.overviewText}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, overviewText: e.target.value }))
                      }
                      placeholder="Write the clinical methodology, therapy principles, scientific approach, and parent expectations here. Separate each paragraph with a blank line..."
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-normal text-slate-800 text-sm leading-relaxed focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Dynamic Core Program Highlights */}
                  <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-black text-xs uppercase tracking-wider text-slate-800 block">
                          Core Program Highlights
                        </span>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                          Key takeaways displayed as checkmark cards below the overview text.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={addFeature}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Highlight</span>
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                        Highlights Section Heading
                      </label>
                      <input
                        type="text"
                        value={formData.overviewHighlightsTitle}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, overviewHighlightsTitle: e.target.value }))
                        }
                        placeholder="e.g. CORE PROGRAM HIGHLIGHTS"
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-2.5 pt-1">
                      {formData.features.length === 0 ? (
                        <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl bg-white">
                          <p className="text-xs text-slate-400 font-medium">No highlights added yet.</p>
                          <button
                            type="button"
                            onClick={addFeature}
                            className="text-xs text-blue-600 font-bold mt-1 inline-flex items-center gap-1 cursor-pointer hover:underline"
                          >
                            <Plus className="w-3 h-3" /> Add first highlight
                          </button>
                        </div>
                      ) : (
                        formData.features.map((feat, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                            <input
                              type="text"
                              value={feat}
                              onChange={(e) => updateFeature(idx, e.target.value)}
                              placeholder={`Highlight #${idx + 1} (e.g. Registered Behaviour Analyst)`}
                              className="flex-1 p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                            />
                            <button
                              type="button"
                              onClick={() => removeFeature(idx)}
                              title="Delete highlight"
                              className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl border border-rose-200/60 transition-colors cursor-pointer shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))
                      )}
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
                      Checklist Card Subtitle / Prompt
                    </label>
                    <input
                      type="text"
                      value={formData.checklistSubtitle}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, checklistSubtitle: e.target.value }))
                      }
                      placeholder="e.g. This therapy is recommended if your child demonstrates:"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Dynamic Checklist Signs */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                        Checklist Signs / Red Flag Points ({formData.checklistSigns.length})
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

                    {formData.checklistSigns.length === 0 ? (
                      <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center space-y-2 bg-slate-50/50">
                        <ListCheck className="w-8 h-8 text-slate-400 mx-auto" />
                        <p className="text-xs font-bold text-slate-700">No checklist points added yet</p>
                        <p className="text-[11px] text-slate-500">
                          Click &quot;Add Sign&quot; to add checklist indicators for parents.
                        </p>
                        <button
                          type="button"
                          onClick={addChecklistSign}
                          className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 cursor-pointer shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add First Sign</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {formData.checklistSigns.map((sign, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 text-xs font-black flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <input
                              type="text"
                              value={sign}
                              onChange={(e) => updateChecklistSign(idx, e.target.value)}
                              placeholder="e.g. Delays in speech, verbal communication, or expressing wants/needs"
                              className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                            />
                            <button
                              type="button"
                              onClick={() => removeChecklistSign(idx)}
                              className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Sign"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: OUTCOMES & BENEFITS (4 CARDS) */}
              {activeTab === "benefits" && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-slate-900 text-sm">
                        Key Clinical Benefits & Developmental Outcomes
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">
                        Numbered cards (01, 02, 03, 04) showing measurable child progress and developmental gains.
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

                  {formData.keyBenefits.length === 0 ? (
                    <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center space-y-2 bg-slate-50/50">
                      <Award className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="text-xs font-bold text-slate-700">No outcome cards added yet</p>
                      <p className="text-[11px] text-slate-500">
                        Click &quot;Add Outcome Card&quot; to add key clinical outcome cards (01, 02, etc.).
                      </p>
                      <button
                        type="button"
                        onClick={addBenefitCard}
                        className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 cursor-pointer shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add First Outcome Card</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {formData.keyBenefits.map((item, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 space-y-2.5 relative"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
                              <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xs">
                                0{idx + 1}
                              </span>
                              <span>Outcome Card #{idx + 1}</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => removeBenefitCard(idx)}
                              className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove</span>
                            </button>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-600">Card Title</label>
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) => updateBenefitCard(idx, "title", e.target.value)}
                              placeholder="e.g. Verbal & Communication Growth"
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
                              placeholder="e.g. Building functional language, speech, and alternative communication tools."
                              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-normal text-xs text-slate-800 focus:outline-none focus:border-blue-500 leading-relaxed"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: STEP-BY-STEP PROCESS */}
              {activeTab === "process" && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-slate-900 text-sm">
                        How We Deliver This Therapy Step-By-Step
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">
                        Structured clinical roadmap steps (01, 02, 03, 04) explaining the child&apos;s therapy journey.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addProcessStep}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 text-white rounded-xl text-xs font-extrabold hover:bg-blue-700 transition-all shadow-sm cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Process Step</span>
                    </button>
                  </div>

                  {formData.clinicalProcess.length === 0 ? (
                    <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center space-y-2 bg-slate-50/50">
                      <Compass className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="text-xs font-bold text-slate-700">No process steps added yet</p>
                      <p className="text-[11px] text-slate-500">
                        Click &quot;Add Process Step&quot; to add step-by-step therapy roadmap cards (01, 02, 03, etc.).
                      </p>
                      <button
                        type="button"
                        onClick={addProcessStep}
                        className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 cursor-pointer shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add First Process Step</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {formData.clinicalProcess.map((proc, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 space-y-2.5 relative"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
                              <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xs">
                                {proc.stepNumber || String(idx + 1).padStart(2, "0")}
                              </span>
                              <span>Process Step #{idx + 1}</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => removeProcessStep(idx)}
                              className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove</span>
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                            <div className="sm:col-span-1 space-y-1">
                              <label className="text-[11px] font-bold text-slate-600">Step #</label>
                              <input
                                type="text"
                                value={proc.stepNumber}
                                onChange={(e) => updateProcessStep(idx, "stepNumber", e.target.value)}
                                placeholder="01"
                                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-xs text-slate-800 focus:outline-none focus:border-blue-500 text-center"
                              />
                            </div>
                            <div className="sm:col-span-3 space-y-1">
                              <label className="text-[11px] font-bold text-slate-600">Step Title</label>
                              <input
                                type="text"
                                value={proc.title}
                                onChange={(e) => updateProcessStep(idx, "title", e.target.value)}
                                placeholder="e.g. Initial Intake & Assessment"
                                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-600">
                              Step Description
                            </label>
                            <textarea
                              rows={2}
                              value={proc.description}
                              onChange={(e) => updateProcessStep(idx, "description", e.target.value)}
                              placeholder="e.g. Evaluating current skill levels, motivation factors, and communication baseline."
                              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-normal text-xs text-slate-800 focus:outline-none focus:border-blue-500 leading-relaxed"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 6: FAQS (SAWAAL - JAWAAB) */}
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

                  {formData.faqs.length === 0 ? (
                    <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center space-y-2 bg-slate-50/50">
                      <HelpCircle className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="text-xs font-bold text-slate-700">No FAQs added yet</p>
                      <p className="text-[11px] text-slate-500">
                        Click &quot;Add FAQ&quot; to add frequently asked questions for parents.
                      </p>
                      <button
                        type="button"
                        onClick={addFaq}
                        className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 cursor-pointer shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add First FAQ</span>
                      </button>
                    </div>
                  ) : (
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
                            <button
                              type="button"
                              onClick={() => removeFaq(idx)}
                              className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove</span>
                            </button>
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
                  )}

                  {/* Step 6: Program Publishing & Display Order Settings (Placed in final step) */}
                  <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/80 space-y-3 mt-6">
                    <span className="font-black text-xs uppercase tracking-wider text-slate-800 block">
                      Program Publishing & Display Settings
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
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
                          className="w-full p-3 bg-white border border-slate-200 rounded-2xl font-semibold text-slate-800 text-sm focus:outline-none focus:border-blue-500"
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
                          <option value="ACTIVE">ACTIVE (Live on website)</option>
                          <option value="INACTIVE">INACTIVE (Hidden)</option>
                          <option value="DRAFT">DRAFT (Under review)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Bottom Footer Bar (Back / Next Step Wizard Navigation) */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between sticky bottom-0 bg-white z-10 shrink-0">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setModalMode(null)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <span className="text-[11px] font-extrabold text-slate-400">
                    Step {currentTabIndex + 1} of {tabOrder.length}
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  {/* Back Button (Visible when step > 1) */}
                  {currentTabIndex > 0 && (
                    <button
                      type="button"
                      onClick={goToPrevTab}
                      className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>
                  )}

                  {/* Next Step Button (Visible on Steps 1 to 5) */}
                  {currentTabIndex < tabOrder.length - 1 ? (
                    <>
                      {/* Secondary Quick Save if Editing */}
                      {modalMode === "EDIT" && (
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5 text-slate-500" />
                          <span>Save Now</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={goToNextTab}
                        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-blue-600/25 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Next Step</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    /* Final Publish Button on Step 6 */
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-600/25 transition-all disabled:opacity-50 cursor-pointer"
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
                  )}
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
