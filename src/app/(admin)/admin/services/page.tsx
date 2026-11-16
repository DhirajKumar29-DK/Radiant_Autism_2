"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Brain,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  X,
  Save,
  Layers,
  Sparkles,
  ShieldCheck,
  Activity,
  Smile,
  Compass,
  MessageCircle,
} from "lucide-react";
import AdminPagination from "@/components/common/AdminPagination";
import ConfirmModal from "@/components/common/ConfirmModal";

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
  isActive: boolean;
  order: number;
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalMode, setModalMode] = useState<"ADD" | "EDIT" | null>(null);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<ServiceItem | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    tagline: "",
    badge: "OAP Covered",
    badgeBg: "bg-blue-600",
    iconName: "Brain",
    image: "/hero_child_therapy.jpg",
    shortDescription: "",
    overviewParagraphs: "",
    ageGroup: "2 to 20 Years",
    sessionFormat: "1:1 Individualized Clinical Sessions",
    duration: "Customized Care Plan",
    clinicalLead: "Registered Behaviour Analyst (RBA)",
    featuresText: "",
    isActive: true,
    order: 0,
  });

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/services");
      if (res.ok) {
        const data = await res.json();
        setServices(data.services || []);
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
      badge: "OAP Covered",
      badgeBg: "bg-blue-600",
      iconName: "Brain",
      image: "/hero_child_therapy.jpg",
      shortDescription: "",
      overviewParagraphs: "",
      ageGroup: "2 to 20 Years",
      sessionFormat: "1:1 Individualized Clinical Sessions",
      duration: "Customized Care Plan",
      clinicalLead: "Registered Behaviour Analyst (RBA)",
      featuresText: "RBA Supervised Clinical Care\nAges 2 to 20 Years\nIndividualized Care Plan",
      isActive: true,
      order: services.length + 1,
    });
    setEditingService(null);
    setModalMode("ADD");
  };

  const openEditModal = (svc: ServiceItem) => {
    setEditingService(svc);
    let parsedFeatures: string[] = [];
    try {
      if (svc.features) {
        parsedFeatures = JSON.parse(svc.features);
      }
    } catch {
      parsedFeatures = [];
    }

    let parsedOverview = "";
    try {
      if (svc.overviewParagraphs) {
        const arr = JSON.parse(svc.overviewParagraphs);
        if (Array.isArray(arr)) {
          parsedOverview = arr.join("\n\n");
        } else {
          parsedOverview = svc.overviewParagraphs;
        }
      }
    } catch {
      parsedOverview = svc.overviewParagraphs || "";
    }

    setFormData({
      title: svc.title,
      slug: svc.slug,
      tagline: svc.tagline || "",
      badge: svc.badge || "OAP Covered",
      badgeBg: svc.badgeBg || "bg-blue-600",
      iconName: svc.iconName || "Brain",
      image: svc.image || "/hero_child_therapy.jpg",
      shortDescription: svc.shortDescription || "",
      overviewParagraphs: parsedOverview,
      ageGroup: svc.ageGroup || "2 to 20 Years",
      sessionFormat: svc.sessionFormat || "1:1 Individualized Clinical Sessions",
      duration: svc.duration || "Customized Care Plan",
      clinicalLead: svc.clinicalLead || "Registered Behaviour Analyst (RBA)",
      featuresText: parsedFeatures.join("\n"),
      isActive: svc.isActive,
      order: svc.order || 0,
    });
    setModalMode("EDIT");
  };

  const handleToggleActive = async (svc: ServiceItem) => {
    try {
      const updatedStatus = !svc.isActive;
      const res = await fetch(`/api/admin/services/${svc.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: updatedStatus }),
      });
      if (res.ok) {
        setServices((prev) =>
          prev.map((item) => (item.id === svc.id ? { ...item, isActive: updatedStatus } : item))
        );
      }
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Split features by newline
      const featuresArray = formData.featuresText
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean);

      // Split overview paragraphs by double newline
      const overviewArray = formData.overviewParagraphs
        .split("\n\n")
        .map((p) => p.trim())
        .filter(Boolean);

      const payload = {
        title: formData.title,
        slug: formData.slug || formData.title.toLowerCase().replace(/\s+/g, "-"),
        tagline: formData.tagline,
        badge: formData.badge,
        badgeBg: formData.badgeBg,
        iconBg: formData.badgeBg,
        bulletColor: formData.badgeBg.replace("bg-", "text-"),
        iconName: formData.iconName,
        image: formData.image,
        shortDescription: formData.shortDescription,
        overviewParagraphs: JSON.stringify(overviewArray),
        ageGroup: formData.ageGroup,
        sessionFormat: formData.sessionFormat,
        duration: formData.duration,
        clinicalLead: formData.clinicalLead,
        features: JSON.stringify(featuresArray),
        isActive: formData.isActive,
        order: Number(formData.order),
      };

      if (modalMode === "ADD") {
        const res = await fetch("/api/admin/services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          fetchServices();
          setModalMode(null);
        } else {
          const errData = await res.json();
          alert(errData.error || "Failed to create service");
        }
      } else if (modalMode === "EDIT" && editingService) {
        const res = await fetch(`/api/admin/services/${editingService.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          fetchServices();
          setModalMode(null);
        } else {
          const errData = await res.json();
          alert(errData.error || "Failed to update service");
        }
      }
    } catch (err) {
      console.error("Submit error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/services/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setServices((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Clinical Services & Therapy Programs
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-extrabold text-xs">
              {services.length} Active
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Manage pediatric therapy offerings, descriptions, clinical leads, age groups, and visibility on the live website.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold rounded-2xl shadow-lg shadow-blue-600/30 transition-all uppercase tracking-wider"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Clinical Program</span>
        </button>
      </div>

      {/* Services Grid */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">
            Loading Clinical Programs...
          </p>
        </div>
      ) : services.length === 0 ? (
        <div className="bg-white p-16 rounded-3xl border border-slate-200 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Brain className="w-7 h-7" />
          </div>
          <h3 className="text-slate-900 font-bold text-base">No Clinical Programs Registered</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
            Click the button above to add your first pediatric clinical service program.
          </p>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
          >
            Create Program
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((svc) => (
              <div
                key={svc.id}
                className={`bg-white rounded-3xl border transition-all overflow-hidden flex flex-col justify-between ${
                  svc.isActive
                    ? "border-slate-200/90 shadow-xs hover:shadow-md hover:border-blue-400"
                    : "border-slate-200 opacity-60 bg-slate-50/50"
                }`}
              >
                {/* Top Image Preview & Badge */}
                <div className="relative h-44 w-full bg-slate-100 overflow-hidden group">
                  <Image
                    src={svc.image || "/hero_child_therapy.jpg"}
                    alt={svc.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-white text-[10px] font-black uppercase tracking-wider shadow-sm ${
                        svc.badgeBg || "bg-blue-600"
                      }`}
                    >
                      {svc.badge || "Clinical Care"}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <button
                      onClick={() => handleToggleActive(svc)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm backdrop-blur-md ${
                        svc.isActive
                          ? "bg-emerald-500/90 text-white"
                          : "bg-rose-500/90 text-white"
                      }`}
                    >
                      {svc.isActive ? (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          <span>Visible</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" />
                          <span>Hidden</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="text-[10px] font-mono uppercase text-blue-200 font-bold">
                      /{svc.slug}
                    </span>
                    <h3 className="font-black text-base line-clamp-1">{svc.title}</h3>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <p className="text-xs text-slate-600 font-medium line-clamp-2 leading-relaxed">
                      {svc.shortDescription || svc.tagline || "No description provided."}
                    </p>

                    <div className="pt-2 border-t border-slate-100 space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between text-slate-500">
                        <span className="font-bold">Target Age:</span>
                        <span className="font-extrabold text-slate-800">{svc.ageGroup || "All Ages"}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-500">
                        <span className="font-bold">Clinical Lead:</span>
                        <span className="font-extrabold text-slate-800 line-clamp-1 max-w-[170px] text-right">
                          {svc.clinicalLead || "RBA Team"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-500">
                        <span className="font-bold">Display Order:</span>
                        <span className="font-mono font-bold text-slate-700">#{svc.order}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <Link
                      href={`/services/${svc.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-wider"
                    >
                      <span>Preview Page</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(svc)}
                        className="p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Edit Service"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setServiceToDelete(svc);
                          setIsDeleteOpen(true);
                        }}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Service"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <AdminPagination
            currentPage={currentPage}
            totalItems={services.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(val) => {
              setItemsPerPage(val);
              setCurrentPage(1);
            }}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setServiceToDelete(null);
        }}
        onConfirm={async () => {
          if (serviceToDelete) {
            await handleDelete(serviceToDelete.id);
            setIsDeleteOpen(false);
            setServiceToDelete(null);
          }
        }}
        title="Delete Clinical Program?"
        message={`Are you sure you want to delete "${serviceToDelete?.title}"? This program will be permanently removed from the website catalog and database.`}
        confirmText="Delete Program"
        cancelText="Cancel"
      />

      {/* Add / Edit Program Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-4xl max-h-[88vh] flex flex-col overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200 my-auto">
            {/* Modal Header */}
            <div className="px-6 sm:px-8 py-4 sm:py-5 border-b border-slate-200 flex justify-between items-center bg-white shrink-0 sticky top-0 z-20">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600">
                  {modalMode === "ADD" ? "New Therapy Offering" : "Update Program Details"}
                </span>
                <h2 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
                  {modalMode === "ADD" ? "Create Clinical Service" : `Edit: ${formData.title}`}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="p-2 rounded-2xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form id="service-modal-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-5 text-xs">
              {/* Row 1: Title & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                    Program Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        title: newTitle,
                        slug:
                          modalMode === "ADD"
                            ? newTitle
                                .toLowerCase()
                                .replace(/[^a-z0-9]+/g, "-")
                                .replace(/^-|-$/g, "")
                            : prev.slug,
                      }));
                    }}
                    placeholder="e.g. Applied Behavior Analysis (ABA)"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                    URL Slug * (Unique)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                    placeholder="e.g. aba-therapy"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Row 2: Tagline & Image */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                    Tagline (One-line Hook)
                  </label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={(e) => setFormData((prev) => ({ ...prev, tagline: e.target.value }))}
                    placeholder="e.g. Evidence-based behavioral support for childhood growth."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                    Image Path or URL
                  </label>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData((prev) => ({ ...prev, image: e.target.value }))}
                    placeholder="e.g. /hero_child_therapy.jpg or https://..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Row 3: Badge, Badge Color & Order */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                    Card Badge Text
                  </label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData((prev) => ({ ...prev, badge: e.target.value }))}
                    placeholder="e.g. OAP Covered"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                    Badge Color Scheme
                  </label>
                  <select
                    value={formData.badgeBg}
                    onChange={(e) => setFormData((prev) => ({ ...prev, badgeBg: e.target.value }))}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  >
                    <option value="bg-blue-600">Blue (Default / ABA)</option>
                    <option value="bg-teal-600">Teal (Speech SLP)</option>
                    <option value="bg-amber-600">Amber (Occupational OT)</option>
                    <option value="bg-purple-600">Purple (Life Skills)</option>
                    <option value="bg-emerald-600">Emerald (Social Groups)</option>
                    <option value="bg-indigo-600">Indigo (Parent Coaching)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData((prev) => ({ ...prev, order: Number(e.target.value) }))}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Row 4: Clinical Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                    Target Age Group
                  </label>
                  <input
                    type="text"
                    value={formData.ageGroup}
                    onChange={(e) => setFormData((prev) => ({ ...prev, ageGroup: e.target.value }))}
                    placeholder="e.g. 2 to 20 Years"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                    Session Format
                  </label>
                  <input
                    type="text"
                    value={formData.sessionFormat}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, sessionFormat: e.target.value }))
                    }
                    placeholder="e.g. 1:1 & Small Group Individualized"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                    Clinical Lead Supervisor
                  </label>
                  <input
                    type="text"
                    value={formData.clinicalLead}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, clinicalLead: e.target.value }))
                    }
                    placeholder="e.g. Jesenia Duran, RBA"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Short Description */}
              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                  Card Short Summary
                </label>
                <textarea
                  rows={2}
                  value={formData.shortDescription}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, shortDescription: e.target.value }))
                  }
                  placeholder="Summary shown on the cards on the Services page..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Overview Paragraphs */}
              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                  Detailed Clinical Overview (Separate paragraphs with double Enter)
                </label>
                <textarea
                  rows={4}
                  value={formData.overviewParagraphs}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, overviewParagraphs: e.target.value }))
                  }
                  placeholder="Detailed breakdown shown on the single service page..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Bullet Features */}
              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                  Key Features / Bullets (One per line)
                </label>
                <textarea
                  rows={3}
                  value={formData.featuresText}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, featuresText: e.target.value }))
                  }
                  placeholder="RBA Supervised Clinical Care&#10;Target Verbal & Life Skills&#10;OAP Funding Covered"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Visibility Checkbox */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={formData.isActive}
                  onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <label htmlFor="isActiveToggle" className="font-bold text-slate-800 cursor-pointer">
                  Publish to Live Website Catalog (Active)
                </label>
              </div>
            </form>

            {/* Modal Sticky Footer */}
            <div className="px-6 sm:px-8 py-4 border-t border-slate-200 flex justify-end gap-3 bg-slate-50 shrink-0">
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="px-5 py-2.5 rounded-2xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="service-modal-form"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold uppercase tracking-wider shadow-md shadow-blue-600/30 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{modalMode === "ADD" ? "Create Program" : "Save Changes"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
