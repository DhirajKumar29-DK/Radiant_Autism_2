"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  Plus,
  Edit3,
  Trash2,
  X,
  Star,
  Search,
  Loader2,
  CheckCircle,
  MessageSquareQuote,
  Save,
  CheckCircle2,
} from "lucide-react";
import AdminPagination from "@/components/common/AdminPagination";
import ConfirmModal from "@/components/common/ConfirmModal";
import ImageUploadField from "@/components/admin/ImageUploadField";

type StatusType = "ACTIVE" | "INACTIVE" | "DRAFT";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  service: string | null;
  image: string | null;
  text: string;
  rating: number;
  displayOrder: number;
  status: StatusType;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Testimonial | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Selection & Bulk Action
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [deleteTargetIds, setDeleteTargetIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    service: "",
    image: "/hero_child_therapy.jpg",
    text: "",
    rating: 5,
    displayOrder: 1,
    status: "ACTIVE" as StatusType,
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  const fetchTestimonials = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/testimonials");
      if (res.ok) {
        const data = await res.json();
        const mapped: Testimonial[] = (data.testimonials || []).map((t: any) => ({
          ...t,
          status: (t.status as StatusType) || (t.isActive ? "ACTIVE" : "INACTIVE"),
        }));
        setTestimonials(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch testimonials:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const openAddModal = () => {
    setSelectedItem(null);
    setFormData({
      name: "",
      role: "",
      service: "",
      image: "/hero_child_therapy.jpg",
      text: "",
      rating: 5,
      displayOrder: testimonials.length + 1,
      status: "ACTIVE",
    });
    setSaveSuccess(false);
    setIsModalOpen(true);
  };

  const openEditModal = (item: Testimonial) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      role: item.role,
      service: item.service || "",
      image: item.image || "/hero_child_therapy.jpg",
      text: item.text,
      rating: item.rating,
      displayOrder: item.displayOrder,
      status: item.status || (item.isActive ? "ACTIVE" : "INACTIVE"),
    });
    setSaveSuccess(false);
    setIsModalOpen(true);
  };

  // Filter & Search
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return testimonials;
    const q = searchQuery.toLowerCase();
    return testimonials.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.role.toLowerCase().includes(q) ||
        (item.service && item.service.toLowerCase().includes(q)) ||
        item.text.toLowerCase().includes(q)
    );
  }, [testimonials, searchQuery]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  // Selection handlers
  const toggleSelectAll = () => {
    if (paginatedItems.length > 0 && paginatedItems.every((t) => selectedIds.includes(t.id))) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedItems.map((t) => t.id));
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
  const cycleStatus = async (item: Testimonial) => {
    const nextStatus: StatusType =
      item.status === "ACTIVE"
        ? "INACTIVE"
        : item.status === "INACTIVE"
        ? "DRAFT"
        : "ACTIVE";

    try {
      const res = await fetch(`/api/admin/testimonials/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setTestimonials((prev) =>
          prev.map((t) =>
            t.id === item.id
              ? { ...t, status: nextStatus, isActive: nextStatus === "ACTIVE" }
              : t
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
        const res = await fetch(`/api/admin/testimonials/${id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          setTestimonials((prev) => prev.filter((item) => item.id !== id));
          setSelectedIds((prev) => prev.filter((item) => item !== id));
        }
      } else {
        const res = await fetch("/api/admin/testimonials", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: deleteTargetIds }),
        });
        if (res.ok) {
          setTestimonials((prev) =>
            prev.filter((item) => !deleteTargetIds.includes(item.id))
          );
          setSelectedIds([]);
        }
      }
      setIsConfirmDeleteOpen(false);
      setDeleteTargetIds([]);
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting testimonial(s)");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const payload = {
        ...formData,
        rating: Number(formData.rating) || 5,
        displayOrder: Number(formData.displayOrder) || 0,
      };

      const url = selectedItem
        ? `/api/admin/testimonials/${selectedItem.id}`
        : "/api/admin/testimonials";
      const method = selectedItem ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSaveSuccess(true);
        await fetchTestimonials();
        setTimeout(() => {
          setIsModalOpen(false);
          setSaveSuccess(false);
        }, 1000);
      } else {
        const error = await res.json().catch(() => ({}));
        alert(error.error || "Failed to save testimonial");
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("Network error while saving");
    } finally {
      setIsSaving(false);
    }
  };

  const renderStatusBadge = (st: StatusType, item: Testimonial) => {
    switch (st) {
      case "ACTIVE":
        return (
          <button
            type="button"
            onClick={() => cycleStatus(item)}
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
            onClick={() => cycleStatus(item)}
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
            onClick={() => cycleStatus(item)}
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Client Testimonials & Stories
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-extrabold text-xs">
              {testimonials.length} Reviews
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Manage authentic family feedback, star ratings, and child therapy success stories displayed on the website.
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
            <span>Add Testimonial</span>
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
        <Search className="w-4 h-4 text-slate-400 ml-2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Search by parent name, child relation, therapy program, or review quote..."
          className="w-full bg-transparent text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="p-1 text-slate-400 hover:text-slate-600 mr-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Table View (FabFit Style) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">
              Loading Testimonials...
            </p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white p-16 rounded-3xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <MessageSquareQuote className="w-7 h-7" />
            </div>
            <h3 className="text-slate-900 font-bold text-base">No Testimonials Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
              {searchQuery
                ? `No reviews match "${searchQuery}". Try clearing search.`
                : "Add your first family testimonial to showcase parent trust and child outcomes."}
            </p>
            <button
              type="button"
              onClick={openAddModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
            >
              Add First Testimonial
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
                        paginatedItems.length > 0 &&
                        paginatedItems.every((t) => selectedIds.includes(t.id))
                      }
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </th>
                  <th className="py-4 px-3 w-12 text-center">#</th>
                  <th className="py-4 px-6">Family / Client</th>
                  <th className="py-4 px-6">Program / Service</th>
                  <th className="py-4 px-6">Rating</th>
                  <th className="py-4 px-6">Quote Snippet</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {paginatedItems.map((item, idx) => {
                  const rowNumber = (currentPage - 1) * itemsPerPage + idx + 1;
                  const isSelected = selectedIds.includes(item.id);

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/50 transition-colors ${
                        isSelected ? "bg-blue-50/30" : ""
                      }`}
                    >
                      <td className="py-4 pl-6 pr-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(item.id)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>

                      <td className="py-4 px-3 font-bold text-slate-400 text-center">
                        {rowNumber}
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 border border-slate-200 relative shrink-0">
                            {item.image ? (
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-black text-blue-600 text-xs">
                                {item.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900">{item.name}</p>
                            <p className="text-[11px] text-slate-400 font-medium line-clamp-1">
                              {item.role}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        {item.service ? (
                          <span className="inline-block px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-[11px] font-extrabold border border-blue-100">
                            {item.service}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium">—</span>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1 text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < item.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "fill-slate-200 text-slate-200"
                              }`}
                            />
                          ))}
                          <span className="text-[11px] font-black text-slate-700 ml-1">
                            {item.rating}.0
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-6 font-medium text-slate-600 max-w-sm">
                        <p className="line-clamp-2 leading-relaxed italic">
                          &quot;{item.text}&quot;
                        </p>
                      </td>

                      {/* Status Badge with Click-to-Cycle */}
                      <td className="py-4 px-6">
                        {renderStatusBadge(item.status, item)}
                      </td>

                      {/* Dual Action: Edit + Delete */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            title="Edit Testimonial"
                            className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200/80 transition-all inline-flex items-center gap-1.5 font-bold cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                            <span className="text-[11px]">Edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => confirmSingleDelete(item.id)}
                            title="Soft Delete Testimonial"
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
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex justify-end">
            <AdminPagination
              currentPage={currentPage}
              totalItems={filteredItems.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* POPUP MODAL (Add / Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-100">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  {selectedItem ? "Edit Testimonial" : "Add Parent Testimonial"}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Update client name, relation/role, service tag, star rating, and review text.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Name & Relation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                    Client / Parent Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Maria Gonzalez"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                    Relation / Role
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
                    placeholder="e.g. Parent of 4-year-old Lucas"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                  />
                </div>
              </div>

              {/* Service & Rating */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                    Therapy Program / Service
                  </label>
                  <input
                    type="text"
                    value={formData.service}
                    onChange={(e) => setFormData((prev) => ({ ...prev, service: e.target.value }))}
                    placeholder="e.g. Early Intervention ABA, Speech Therapy"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                    Star Rating (1 - 5)
                  </label>
                  <div className="flex items-center gap-2 pt-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, rating: s }))}
                        className="p-1 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            s <= formData.rating
                              ? "fill-amber-400 text-amber-400"
                              : "fill-slate-200 text-slate-200"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-black text-slate-700 ml-2">
                      {formData.rating} Stars
                    </span>
                  </div>
                </div>
              </div>

              {/* Photo Upload Field */}
              <ImageUploadField
                label="Parent / Child Photo (Optional)"
                value={formData.image}
                onChange={(url) => setFormData((prev) => ({ ...prev, image: url }))}
                recommendedSize="400 x 400px (Square Avatar)"
              />

              {/* Display Order */}
              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      displayOrder: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="w-32 p-3 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Review Text */}
              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                  Testimonial / Review Content *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.text}
                  onChange={(e) => setFormData((prev) => ({ ...prev, text: e.target.value }))}
                  placeholder="Share the family's journey, milestones achieved at Radiant Autism Services, and personal experiences with our clinical team..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-normal text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 leading-relaxed"
                />
              </div>

              {/* Status DDL (Publish or Draft at bottom of form) */}
              <div className="space-y-1.5 pt-3 border-t border-slate-100">
                <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                  Review Status (Publish or Draft)
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, status: e.target.value as StatusType }))
                  }
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                >
                  <option value="ACTIVE">🟢 Published (Active - Live on website)</option>
                  <option value="DRAFT">🟡 Draft (Hidden / In Progress)</option>
                  <option value="INACTIVE">⚪ Inactive (Deactivated / Hidden)</option>
                </select>
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
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-2xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-600/25 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>{selectedItem ? "Save Changes" : "Publish Testimonial"}</span>
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
            ? `Delete ${deleteTargetIds.length} Testimonials?`
            : "Delete Testimonial?"
        }
        message={
          deleteTargetIds.length > 1
            ? `Are you sure you want to soft delete the selected ${deleteTargetIds.length} testimonials? They will be hidden from the website.`
            : "Are you sure you want to soft delete this testimonial? It will be hidden from the website."
        }
        confirmText={
          isDeleting
            ? "Deleting..."
            : deleteTargetIds.length > 1
            ? `Delete ${deleteTargetIds.length} Reviews`
            : "Delete Review"
        }
        variant="danger"
      />
    </div>
  );
}
