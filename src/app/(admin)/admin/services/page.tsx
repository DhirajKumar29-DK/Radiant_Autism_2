"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import AdminPagination from "@/components/common/AdminPagination";
import ConfirmModal from "@/components/common/ConfirmModal";
import ImageUploadField from "@/components/admin/ImageUploadField";

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
  status: StatusType;
  isActive: boolean;
  order: number;
  updatedAt?: string;
  createdAt?: string;
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalMode, setModalMode] = useState<"ADD" | "EDIT" | null>(null);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Selection & Bulk Action
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [deleteTargetIds, setDeleteTargetIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

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
    featuresText: "RBA Supervised Clinical Care\nAges 2 to 20 Years\nIndividualized Care Plan",
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
      status: "ACTIVE",
      order: services.length + 1,
    });
    setEditingService(null);
    setSaveSuccess(false);
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
      status: svc.status || (svc.isActive ? "ACTIVE" : "INACTIVE"),
      order: svc.order || 0,
    });
    setSaveSuccess(false);
    setModalMode("EDIT");
  };

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

  // Quick cycle status from table
  const cycleStatus = async (svc: ServiceItem) => {
    const nextStatus: StatusType =
      svc.status === "ACTIVE"
        ? "INACTIVE"
        : svc.status === "INACTIVE"
        ? "DRAFT"
        : "ACTIVE";

    try {
      const res = await fetch(`/api/admin/services/${svc.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setServices((prev) =>
          prev.map((s) =>
            s.id === svc.id
              ? { ...s, status: nextStatus, isActive: nextStatus === "ACTIVE" }
              : s
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
        const res = await fetch(`/api/admin/services/${id}`, {
          method: "DELETE",
        });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSaveSuccess(false);

    try {
      const featuresArray = formData.featuresText
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean);

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
        status: formData.status,
        isActive: formData.status === "ACTIVE",
        order: Number(formData.order),
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
          alert(errData.error || "Failed to create service");
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
          alert(errData.error || "Failed to update service");
        }
      }
    } catch (err) {
      console.error("Submit error:", err);
      alert("Network or server error");
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
            title="Click to cycle status (ACTIVE -> INACTIVE -> DRAFT)"
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
            title="Click to cycle status (INACTIVE -> DRAFT -> ACTIVE)"
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
            title="Click to cycle status (DRAFT -> ACTIVE -> INACTIVE)"
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

  // Paginated items
  const totalItems = services.length;
  const paginatedServices = services.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Clinical Services & Therapy Programs
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-extrabold text-xs">
              {services.length} Programs
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Manage pediatric therapy offerings, clinical leads, age brackets, descriptions, and live website visibility.
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

      {/* Main Table View (FabFit Style) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">
              Loading Clinical Programs...
            </p>
          </div>
        ) : services.length === 0 ? (
          <div className="bg-white p-16 rounded-3xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Brain className="w-7 h-7" />
            </div>
            <h3 className="text-slate-900 font-bold text-base">No Clinical Programs Registered</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
              Click the button above to add your first pediatric clinical service program.
            </p>
            <button
              type="button"
              onClick={openAddModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
            >
              Create Program
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 pl-6 pr-2 w-10">
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
                  <th className="py-4 px-3 w-12 text-center">#</th>
                  <th className="py-4 px-6">Program / Service</th>
                  <th className="py-4 px-6">Badge Pill</th>
                  <th className="py-4 px-6">Target Age</th>
                  <th className="py-4 px-6">Clinical Lead</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Action</th>
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
                            <p className="text-[11px] text-blue-600 font-mono font-medium">
                              /{svc.slug}
                            </p>
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

                      {/* Status Badge with Click-to-Cycle */}
                      <td className="py-4 px-6">
                        {renderStatusBadge(svc.status, svc)}
                      </td>

                      {/* Dual Action: Edit + Delete */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(svc)}
                            title="Edit Service"
                            className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200/80 transition-all inline-flex items-center gap-1.5 font-bold cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                            <span className="text-[11px]">Edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => confirmSingleDelete(svc.id)}
                            title="Soft Delete Service"
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
        )}

        {/* Pagination */}
        {totalItems > itemsPerPage && (
          <div className="p-4 border-t border-slate-100 flex justify-end">
            <AdminPagination
              currentPage={currentPage}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* POPUP MODAL (Add / Edit) */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-100">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  {modalMode === "ADD" ? "Add Clinical Therapy Service" : "Edit Clinical Service"}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Update program headline, slug, clinical lead, age group, photo, and features.
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

            {/* Modal Body Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* STATUS SELECTOR (Active / Inactive / Draft) */}
              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                  Program Visibility Status
                </label>
                <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/70">
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, status: "ACTIVE" }))}
                    className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                      formData.status === "ACTIVE"
                        ? "bg-white text-emerald-700 shadow-xs border border-emerald-200"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>ACTIVE</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, status: "INACTIVE" }))}
                    className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                      formData.status === "INACTIVE"
                        ? "bg-white text-slate-700 shadow-xs border border-slate-300"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    <span>INACTIVE</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, status: "DRAFT" }))}
                    className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                      formData.status === "DRAFT"
                        ? "bg-white text-amber-700 shadow-xs border border-amber-200"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>DRAFT</span>
                  </button>
                </div>
              </div>

              {/* Title & Slug */}
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
                    placeholder="e.g. ABA Therapy"
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
                    onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                    placeholder="e.g. aba-therapy"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Badge & Clinical Lead */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                    Badge Tagline
                  </label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData((prev) => ({ ...prev, badge: e.target.value }))}
                    placeholder="e.g. OAP Covered, Registered Clinician"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                    Clinical Lead / Supervisor
                  </label>
                  <input
                    type="text"
                    value={formData.clinicalLead}
                    onChange={(e) => setFormData((prev) => ({ ...prev, clinicalLead: e.target.value }))}
                    placeholder="e.g. Registered Behaviour Analyst (RBA)"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Age Bracket & Session Format */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                    Target Age Group
                  </label>
                  <input
                    type="text"
                    value={formData.ageGroup}
                    onChange={(e) => setFormData((prev) => ({ ...prev, ageGroup: e.target.value }))}
                    placeholder="e.g. 2 to 20 Years"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                    Session Format
                  </label>
                  <input
                    type="text"
                    value={formData.sessionFormat}
                    onChange={(e) => setFormData((prev) => ({ ...prev, sessionFormat: e.target.value }))}
                    placeholder="e.g. 1:1 Individualized Sessions"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Photo Upload */}
              <ImageUploadField
                label="Program Cover Image"
                value={formData.image}
                onChange={(url) => setFormData((prev) => ({ ...prev, image: url }))}
                recommendedSize="1200 x 800px"
              />

              {/* Features List */}
              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                  Clinical Highlights / Features (One per line)
                </label>
                <textarea
                  rows={3}
                  value={formData.featuresText}
                  onChange={(e) => setFormData((prev) => ({ ...prev, featuresText: e.target.value }))}
                  placeholder="RBA Supervised Clinical Care&#10;Ages 2 to 20 Years&#10;Individualized Care Plan"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 leading-relaxed font-mono"
                />
              </div>

              {/* Short Description */}
              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                  Brief Summary / Card Description
                </label>
                <textarea
                  rows={2}
                  value={formData.shortDescription}
                  onChange={(e) => setFormData((prev) => ({ ...prev, shortDescription: e.target.value }))}
                  placeholder="Brief clinical description displayed on the homepage cards..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-normal text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
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
                        <span>{modalMode === "ADD" ? "Create Program" : "Save Changes"}</span>
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
        title={
          deleteTargetIds.length > 1
            ? `Delete ${deleteTargetIds.length} Programs?`
            : "Delete Clinical Program?"
        }
        message={
          deleteTargetIds.length > 1
            ? `Are you sure you want to soft delete the selected ${deleteTargetIds.length} clinical programs? They will be hidden from the website.`
            : "Are you sure you want to soft delete this clinical program? It will be hidden from the website."
        }
        confirmText={
          isDeleting
            ? "Deleting..."
            : deleteTargetIds.length > 1
            ? `Delete ${deleteTargetIds.length} Programs`
            : "Delete Program"
        }
        variant="danger"
      />
    </div>
  );
}
