"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Image as ImageIcon,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  X,
  Save,
  Star,
  Tag,
} from "lucide-react";

interface GalleryItem {
  id: string;
  title: string;
  category: string;
  image: string;
  tag?: string | null;
  isFeatured: boolean;
  order: number;
  isActive: boolean;
}

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalMode, setModalMode] = useState<"ADD" | "EDIT" | null>(null);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const [formData, setFormData] = useState({
    title: "",
    category: "Sensory Gym",
    image: "/gallery_sensory_gym.jpg",
    tag: "",
    isFeatured: false,
    order: 0,
    isActive: true,
  });

  const fetchGallery = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/gallery");
      if (res.ok) {
        const data = await res.json();
        setItems(data.gallery || []);
      }
    } catch (err) {
      console.error("Failed to load gallery:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const openAddModal = () => {
    setFormData({
      title: "",
      category: "Sensory Gym",
      image: "/gallery_sensory_gym.jpg",
      tag: "Sensory Room",
      isFeatured: false,
      order: items.length + 1,
      isActive: true,
    });
    setEditingItem(null);
    setModalMode("ADD");
  };

  const openEditModal = (item: GalleryItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      category: item.category,
      image: item.image,
      tag: item.tag || "",
      isFeatured: item.isFeatured,
      order: item.order || 0,
      isActive: item.isActive,
    });
    setModalMode("EDIT");
  };

  const handleToggleActive = async (item: GalleryItem) => {
    try {
      const updatedStatus = !item.isActive;
      const res = await fetch(`/api/admin/gallery/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: updatedStatus }),
      });
      if (res.ok) {
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, isActive: updatedStatus } : i))
        );
      }
    } catch (err) {
      console.error("Status toggle error:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (modalMode === "ADD") {
        const res = await fetch("/api/admin/gallery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          fetchGallery();
          setModalMode(null);
        } else {
          alert("Failed to create gallery photo");
        }
      } else if (modalMode === "EDIT" && editingItem) {
        const res = await fetch(`/api/admin/gallery/${editingItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          fetchGallery();
          setModalMode(null);
        } else {
          alert("Failed to update gallery photo");
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
      const res = await fetch(`/api/admin/gallery/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== id));
        setDeleteConfirmId(null);
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const filteredItems =
    selectedCategory === "ALL"
      ? items
      : items.filter((i) => i.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Facility & Sensory Center Gallery
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-extrabold text-xs">
              {items.length} Photos
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Showcase sensory rooms, 1:1 behavioral therapy suites, group play environments, and learning materials.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold rounded-2xl shadow-lg shadow-blue-600/30 transition-all uppercase tracking-wider"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Center Photo</span>
        </button>
      </div>

      {/* Categories Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {["ALL", "Sensory Gym", "Therapy Rooms", "Group Play", "Clinical Spaces"].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedCategory === cat
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Photos Grid */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">
            Loading Gallery...
          </p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white p-16 rounded-3xl border border-slate-200 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <ImageIcon className="w-7 h-7" />
          </div>
          <h3 className="text-slate-900 font-bold text-base">No Photos in this Category</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
            Upload sensory gym photos, speech rooms, or child activity areas.
          </p>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
          >
            Upload Photo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-3xl border transition-all overflow-hidden flex flex-col justify-between ${
                item.isActive
                  ? "border-slate-200/90 shadow-xs hover:shadow-md hover:border-blue-400"
                  : "border-slate-200 opacity-60 bg-slate-50/50"
              }`}
            >
              {/* Photo Frame */}
              <div className="relative aspect-16/10 w-full bg-slate-100 overflow-hidden group">
                <Image
                  src={item.image || "/gallery_sensory_gym.jpg"}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-black uppercase tracking-wider">
                    {item.category}
                  </span>
                  {item.isFeatured && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-extrabold flex items-center gap-1 shadow-sm">
                      <Star className="w-3 h-3 fill-current" />
                      <span>Featured</span>
                    </span>
                  )}
                </div>

                <div className="absolute top-3 right-3">
                  <button
                    onClick={() => handleToggleActive(item)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm backdrop-blur-md ${
                      item.isActive
                        ? "bg-emerald-500/90 text-white"
                        : "bg-rose-500/90 text-white"
                    }`}
                  >
                    {item.isActive ? (
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
                  <h3 className="font-black text-base line-clamp-1">{item.title}</h3>
                  {item.tag && (
                    <span className="text-xs text-blue-200 font-bold flex items-center gap-1 mt-0.5">
                      <Tag className="w-3 h-3" />
                      <span>{item.tag}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[10px] font-mono text-slate-400 font-bold">
                  Order #{item.order}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-1.5 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    title="Edit Photo"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(item.id)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete Photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-slate-900 text-base">Delete Gallery Photo?</h3>
              <p className="text-xs text-slate-500 font-medium">
                This image entry will be permanently removed from the website gallery.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-2xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 py-2.5 rounded-2xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-500 transition-colors shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600">
                  {modalMode === "ADD" ? "New Facility Photo" : "Edit Photo Details"}
                </span>
                <h2 className="text-xl font-black text-slate-900 tracking-tight mt-1">
                  {modalMode === "ADD" ? "Upload Center Photo" : `Edit: ${formData.title}`}
                </h2>
              </div>
              <button
                onClick={() => setModalMode(null)}
                className="p-2 rounded-2xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                  Photo Caption / Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Modern Sensory Gym & Swing Corner"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-slate-800"
                  >
                    <option value="Sensory Gym">Sensory Gym</option>
                    <option value="Therapy Rooms">Therapy Rooms</option>
                    <option value="Group Play">Group Play</option>
                    <option value="Clinical Spaces">Clinical Spaces</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                    Tag / Focus Area
                  </label>
                  <input
                    type="text"
                    value={formData.tag}
                    onChange={(e) => setFormData((prev) => ({ ...prev, tag: e.target.value }))}
                    placeholder="e.g. Motor Coordination"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                  Image Path or URL *
                </label>
                <input
                  type="text"
                  required
                  value={formData.image}
                  onChange={(e) => setFormData((prev) => ({ ...prev, image: e.target.value }))}
                  placeholder="e.g. /gallery_sensory_gym.jpg or https://..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                    Display Order #
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData((prev) => ({ ...prev, order: Number(e.target.value) }))}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-slate-800"
                  />
                </div>

                <div className="space-y-2 pt-5">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isFeaturedToggle"
                      checked={formData.isFeatured}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, isFeatured: e.target.checked }))
                      }
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <label
                      htmlFor="isFeaturedToggle"
                      className="font-bold text-slate-800 cursor-pointer"
                    >
                      Featured on Homepage
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="activePhotoToggle"
                  checked={formData.isActive}
                  onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <label htmlFor="activePhotoToggle" className="font-bold text-slate-800 cursor-pointer">
                  Display photo in public website gallery
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-5 py-2.5 rounded-2xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold uppercase tracking-wider shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{modalMode === "ADD" ? "Upload Photo" : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
