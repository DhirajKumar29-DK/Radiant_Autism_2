"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  Image as ImageIcon,
  Plus,
  Edit3,
  Trash2,
  Loader2,
  X,
  Save,
  CheckCircle2,
  Search,
  UploadCloud,
  Eye,
} from "lucide-react";
import AdminPagination from "@/components/common/AdminPagination";
import ConfirmModal from "@/components/common/ConfirmModal";

type StatusType = "ACTIVE" | "INACTIVE" | "DRAFT";

interface GalleryItem {
  id: string;
  title: string;
  category: string;
  image: string;
  tag?: string | null;
  isFeatured: boolean;
  order: number;
  status: StatusType;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [services, setServices] = useState<{ id: string; title: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalMode, setModalMode] = useState<"ADD" | "EDIT" | null>(null);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Uploading state
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [previewImageModalUrl, setPreviewImageModalUrl] = useState<string | null>(null);

  // Selection & Bulk Action
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [deleteTargetIds, setDeleteTargetIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Exact 3 fields for modal: title, category, image
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    image: "",
  });

  const fetchGallery = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/gallery");
      if (res.ok) {
        const data = await res.json();
        const mapped: GalleryItem[] = (data.gallery || []).map((g: any) => ({
          ...g,
          status: (g.status as StatusType) || (g.isActive ? "ACTIVE" : "INACTIVE"),
        }));
        setItems(mapped);
      }
    } catch (err) {
      console.error("Failed to load gallery:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await fetch("/api/admin/services");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.services)) {
          const activeList = data.services
            .filter((s: any) => !s.isDeleted && s.isActive !== false)
            .map((s: any) => ({
              id: s.id,
              title: s.title ? s.title.trim() : "",
            }))
            .filter((s: any) => Boolean(s.title));
          setServices(activeList);
        }
      }
    } catch (err) {
      console.error("Failed to load services for gallery categories:", err);
    }
  };

  useEffect(() => {
    fetchGallery();
    fetchServices();
  }, []);

  // Dynamic Category options strictly derived from Services
  const categoryOptions = useMemo(() => {
    const list = services.map((s) => s.title);
    if (list.length > 0) return list;
    return [
      "ABA Therapy (Applied Behavior Analysis)",
      "Speech and Language Service (SLP)",
      "Occupational Therapy (OT)",
      "Sensory Gym",
      "Group Programs",
      "Life Skills & Group Programs",
      "Behaviour Consultation",
      "Psychoeducational Assessments",
      "Psychotherapy Services",
    ];
  }, [services]);

  const filterCategories = useMemo(() => {
    return ["ALL", ...categoryOptions];
  }, [categoryOptions]);

  // Open Add modal with 100% EMPTY fields (no autofill, no dummy image)
  const openAddModal = () => {
    setFormData({
      title: "",
      category: "",
      image: "",
    });
    setSelectedFileName("");
    setUploadError(null);
    setEditingItem(null);
    setSaveSuccess(false);
    setModalMode("ADD");
  };

  const openEditModal = (item: GalleryItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title || "",
      category: item.category || "",
      image: item.image || "",
    });
    setSelectedFileName(item.image ? "Current image attached" : "");
    setUploadError(null);
    setSaveSuccess(false);
    setModalMode("EDIT");
  };

  // Direct file selection and background upload to /api/admin/upload
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Please select a valid image file (JPG, PNG, WEBP).");
      return;
    }

    setIsUploadingImage(true);
    setUploadError(null);
    setSelectedFileName(file.name);

    try {
      const uploadData = new FormData();
      uploadData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: uploadData,
      });

      const json = await res.json();
      if (res.ok && json.success && json.url) {
        setFormData((prev) => ({ ...prev, image: json.url }));
      } else {
        setUploadError(json.error || "Failed to upload file from system.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setUploadError("Network error while uploading photo.");
    } finally {
      setIsUploadingImage(false);
      if (e.target) e.target.value = "";
    }
  };

  // Filter & Search
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchCat =
        selectedCategory === "ALL" ||
        item.category?.toLowerCase() === selectedCategory.toLowerCase();
      const matchSearch =
        !searchQuery.trim() ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [items, selectedCategory, searchQuery]);

  // Reset page to 1 whenever search query or category filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = useMemo(() => {
    return filteredItems.slice(startIndex, endIndex);
  }, [filteredItems, startIndex, endIndex]);

  // Bulk Select Toggle
  const toggleSelectAll = () => {
    if (paginatedItems.every((g) => selectedIds.includes(g.id))) {
      setSelectedIds((prev) => prev.filter((id) => !paginatedItems.some((g) => g.id === id)));
    } else {
      const currentIds = paginatedItems.map((g) => g.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...currentIds])));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Delete Handlers
  const confirmSingleDelete = (id: string) => {
    setDeleteTargetIds([id]);
    setIsConfirmDeleteOpen(true);
  };

  const confirmBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setDeleteTargetIds(selectedIds);
    setIsConfirmDeleteOpen(true);
  };

  const handleExecuteDelete = async () => {
    if (deleteTargetIds.length === 0) return;
    setIsDeleting(true);

    try {
      const res = await fetch("/api/admin/gallery", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: deleteTargetIds }),
      });

      if (res.ok) {
        await fetchGallery();
        setSelectedIds((prev) => prev.filter((id) => !deleteTargetIds.includes(id)));
      } else {
        const singleId = deleteTargetIds[0];
        const resSingle = await fetch(`/api/admin/gallery/${singleId}`, {
          method: "DELETE",
        });
        if (resSingle.ok) {
          await fetchGallery();
          setSelectedIds((prev) => prev.filter((id) => id !== singleId));
        }
      }
      setIsConfirmDeleteOpen(false);
      setDeleteTargetIds([]);
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting photo(s)");
    } finally {
      setIsDeleting(false);
    }
  };

  // Cycle Status (ACTIVE -> INACTIVE -> DRAFT)
  const cycleStatus = async (item: GalleryItem) => {
    const nextStatus: StatusType =
      item.status === "ACTIVE" ? "INACTIVE" : item.status === "INACTIVE" ? "DRAFT" : "ACTIVE";

    try {
      const res = await fetch(`/api/admin/gallery/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextStatus,
          isActive: nextStatus === "ACTIVE",
        }),
      });

      if (res.ok) {
        setItems((prev) =>
          prev.map((g) =>
            g.id === item.id
              ? { ...g, status: nextStatus, isActive: nextStatus === "ACTIVE" }
              : g
          )
        );
      }
    } catch (e) {
      console.error("Status update error:", e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.image) {
      alert("Please select and upload a photo file from your computer.");
      return;
    }
    if (!formData.title.trim()) {
      alert("Please enter a photo title.");
      return;
    }
    if (!formData.category) {
      alert("Please select a category.");
      return;
    }

    setIsSubmitting(true);
    setSaveSuccess(false);

    const payload = {
      title: formData.title.trim(),
      category: formData.category,
      image: formData.image,
      tag: formData.category,
      order: editingItem ? editingItem.order : items.length + 1,
      isFeatured: true,
      status: "ACTIVE",
      isActive: true,
    };

    try {
      if (modalMode === "ADD") {
        const res = await fetch("/api/admin/gallery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          setSaveSuccess(true);
          await fetchGallery();
          setTimeout(() => {
            setModalMode(null);
            setSaveSuccess(false);
          }, 600);
        } else {
          const err = await res.json().catch(() => ({}));
          alert(err.error || "Failed to create gallery item");
        }
      } else if (modalMode === "EDIT" && editingItem) {
        const res = await fetch(`/api/admin/gallery/${editingItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          setSaveSuccess(true);
          await fetchGallery();
          setTimeout(() => {
            setModalMode(null);
            setSaveSuccess(false);
          }, 600);
        } else {
          const err = await res.json().catch(() => ({}));
          alert(err.error || "Failed to update gallery item");
        }
      }
    } catch (err) {
      console.error("Submit error:", err);
      alert("Network or server error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStatusBadge = (st: StatusType, item: GalleryItem) => {
    switch (st) {
      case "ACTIVE":
        return (
          <button
            type="button"
            onClick={() => cycleStatus(item)}
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
            onClick={() => cycleStatus(item)}
            title="Click to cycle status"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 transition-colors cursor-pointer"
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
            title="Click to cycle status"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            DRAFT
          </button>
        );
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 space-y-4 max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Facility & Clinic Gallery
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-extrabold text-xs">
              {items.length} Photos
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Upload and manage showcase images of therapy suites, sensory gym, and clinic spaces.
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
            <span>Add Facility Photo</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="shrink-0 flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {filterCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setSelectedCategory(cat);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search photo title..."
            className="bg-transparent text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none w-full"
          />
        </div>
      </div>

      {/* Main Table View */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col min-h-0 flex-1 overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">
              Loading Facility Photos...
            </p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white p-16 rounded-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <ImageIcon className="w-7 h-7" />
            </div>
            <h3 className="text-slate-900 font-bold text-base">No Photos Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
              Add photos of your clinic, sensory equipment, and specialized therapy rooms.
            </p>
            <button
              type="button"
              onClick={openAddModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Add First Photo
            </button>
          </div>
        ) : (
          <>
            {/* Scrollable Container (Rows scroll cleanly, browser scrollbar hidden) */}
            <div className="overflow-y-auto flex-1 min-h-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <table className="w-full text-left border-collapse min-w-[800px]">
                {/* 1. STICKY THEAD: Scroll karne par headers upar chipke rahenge */}
                <thead className="sticky top-0 z-10 shadow-xs bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-4 pl-6 pr-2 w-10">
                      <input
                        type="checkbox"
                        checked={
                          paginatedItems.length > 0 &&
                          paginatedItems.every((g) => selectedIds.includes(g.id))
                        }
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </th>
                    <th className="py-4 px-3 w-12 text-center">#</th>
                    <th className="py-4 px-6">Photo</th>
                    <th className="py-4 px-6">Title</th>
                    <th className="py-4 px-6">Category</th>
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
                          <div className="w-14 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative shrink-0">
                            <Image
                              src={item.image || "/gallery_sensory_gym.jpg"}
                              alt={item.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </td>

                        <td className="py-4 px-6 font-extrabold text-slate-800 max-w-xs">
                          <p className="line-clamp-1">{item.title}</p>
                        </td>

                        <td className="py-4 px-6">
                          <span className="inline-block px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-[11px] font-extrabold border border-blue-100">
                            {item.category}
                          </span>
                        </td>

                        {/* Status Badge */}
                        <td className="py-4 px-6">
                          {renderStatusBadge(item.status, item)}
                        </td>

                        {/* Action: Edit + Delete */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEditModal(item)}
                              title="Edit Photo"
                              className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200/80 transition-all inline-flex items-center justify-center font-bold cursor-pointer"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => confirmSingleDelete(item.id)}
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

            {/* 3. STICKY PAGINATION: Table ke theek niche pinned */}
            <AdminPagination
              currentPage={currentPage}
              totalItems={filteredItems.length}
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

      {/* ADD / EDIT MODAL - Clean 3 Fields Only (Photo, Title, Category) */}
      {modalMode && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-black text-slate-900 text-lg">
                  {modalMode === "ADD" ? "Add Facility Photo" : "Edit Facility Photo"}
                </h3>
                <p className="text-slate-400 text-xs font-semibold">
                  Upload a photo, enter title, and select category.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* 1. Direct File Upload + Live Thumbnail on Right */}
              <div className="space-y-2">
                <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-blue-600" />
                  <span>Facility Photo File *</span>
                </label>

                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs cursor-pointer border border-blue-200 hover:border-blue-400 transition-all shrink-0">
                    <UploadCloud className="w-4 h-4" />
                    <span>{formData.image ? "Change File" : "Choose File"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </label>

                  {isUploadingImage && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 text-xs font-bold animate-pulse">
                      <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                      <span>Uploading...</span>
                    </div>
                  )}

                  {formData.image && !isUploadingImage && (
                    <div className="flex items-center gap-3 animate-in fade-in">
                      <div
                        onClick={() => setPreviewImageModalUrl(formData.image)}
                        title="Click to preview full image"
                        className="w-14 h-11 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0 shadow-xs relative cursor-pointer hover:ring-2 hover:ring-blue-500 hover:scale-105 transition-all group"
                      >
                        <img
                          src={formData.image}
                          alt="Uploaded preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <Eye className="w-4 h-4 drop-shadow" />
                        </div>
                      </div>
                      <div className="min-w-0">
                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-600">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          Uploaded
                        </span>
                        <p
                          onClick={() => setPreviewImageModalUrl(formData.image)}
                          title="Click to preview"
                          className="text-[10px] text-slate-500 hover:text-blue-600 underline cursor-pointer truncate max-w-[160px] font-medium transition-colors"
                        >
                          {selectedFileName || "Click to view image"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {uploadError && (
                  <p className="text-[11px] font-bold text-rose-600">{uploadError}</p>
                )}
                {!formData.image && !isUploadingImage && (
                  <p className="text-[11px] text-slate-400 font-medium">
                    Click to select JPG, PNG, or WEBP from your system.
                  </p>
                )}
              </div>

              {/* 2. Photo Title */}
              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                  Photo Title / Headline *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Indoor Sensory Gym & Play Area"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                />
              </div>

              {/* 3. Category Dropdown (Dynamically Loaded from Services) */}
              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                  Category (Services se Synced) *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm cursor-pointer"
                >
                  <option value="" disabled>-- Select Category --</option>
                  {categoryOptions.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
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
                    onClick={() => setModalMode(null)}
                    className="px-5 py-2.5 rounded-2xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting || isUploadingImage}
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
                        <span>{modalMode === "ADD" ? "Add Photo" : "Save Changes"}</span>
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
        onClose={() => {
          setIsConfirmDeleteOpen(false);
          setDeleteTargetIds([]);
        }}
        onConfirm={handleExecuteDelete}
        title="Delete Photo(s)"
        message={`Are you sure you want to delete ${deleteTargetIds.length} photo(s)? This will remove them from the public gallery.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        isDeleting={isDeleting}
        variant="danger"
      />

      {/* FULL IMAGE PREVIEW LIGHTBOX POPUP WITH CROSS (X) ICON */}
      {previewImageModalUrl && (
        <div
          className="fixed inset-0 z-60 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 select-none animate-in fade-in duration-150"
          onClick={() => setPreviewImageModalUrl(null)}
        >
          <div
            className="relative max-w-3xl max-h-[85vh] bg-slate-900 rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with Title and Cut (X) Icon */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-slate-950/70 backdrop-blur-md">
              <span className="text-xs font-bold text-slate-200 truncate max-w-md">
                {selectedFileName || "Image Preview"}
              </span>
              <button
                type="button"
                onClick={() => setPreviewImageModalUrl(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Close preview (Cut)"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Large Image Preview */}
            <div className="p-3 sm:p-5 flex items-center justify-center bg-slate-950/60 overflow-auto">
              <img
                src={previewImageModalUrl}
                alt="Full preview"
                className="max-h-[70vh] w-auto h-auto max-w-full rounded-2xl object-contain shadow-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
