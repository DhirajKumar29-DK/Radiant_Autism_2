"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Plus,
  Edit3,
  Trash2,
  X,
  Star,
  Search,
  Quote,
  Loader2,
  CheckCircle,
  MessageSquareQuote,
  Eye,
  EyeOff,
} from "lucide-react";
import AdminPagination from "@/components/common/AdminPagination";
import ConfirmModal from "@/components/common/ConfirmModal";
import ImageUploadField from "@/components/admin/ImageUploadField";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  service: string | null;
  image: string | null;
  text: string;
  rating: number;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
}

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Testimonial | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    service: "",
    image: "/hero_child_therapy.jpg",
    text: "",
    rating: 5,
    displayOrder: 1,
    isActive: true,
  });

  // Delete State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  const fetchTestimonials = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/testimonials");
      if (res.ok) {
        const data = await res.json();
        setTestimonials(data.testimonials || []);
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
      isActive: true,
    });
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
      isActive: item.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        rating: Number(formData.rating) || 5,
        displayOrder: Number(formData.displayOrder) || 0,
      };

      let res;
      if (selectedItem) {
        res = await fetch(`/api/admin/testimonials/${selectedItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/admin/testimonials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        setIsModalOpen(false);
        fetchTestimonials();
      } else {
        const data = await res.json();
        alert(`Failed to save: ${data.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error saving testimonial:", err);
      alert("Failed to save testimonial");
    }
  };

  const triggerDelete = (id: string) => {
    setDeleteTargetId(id);
    setIsConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (!deleteTargetId) return;
    try {
      const res = await fetch(`/api/admin/testimonials/${deleteTargetId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setTestimonials((prev) => prev.filter((t) => t.id !== deleteTargetId));
      }
    } catch (err) {
      console.error("Error deleting testimonial:", err);
    } finally {
      setDeleteTargetId(null);
    }
  };

  // Filtered & Paginated
  const filtered = testimonials.filter((t) => {
    const q = searchQuery.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.role.toLowerCase().includes(q) ||
      (t.service && t.service.toLowerCase().includes(q)) ||
      t.text.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filtered.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="flex flex-col h-full gap-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Parent Reviews & Testimonials
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-black uppercase">
              {testimonials.length} Reviews
            </span>
          </div>
          <p className="text-slate-500 text-xs font-medium mt-1">
            Manage authentic feedback, star ratings, and child therapy success stories displayed on the homepage.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-black text-xs uppercase tracking-wider shadow-md shadow-blue-600/25 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ ADD TESTIMONIAL</span>
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="flex items-center gap-3 bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-xs">
        <Search className="w-4 h-4 text-slate-400 ml-2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Search by parent name, child age, therapy type, or review content..."
          className="w-full bg-transparent text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="p-1 text-slate-400 hover:text-slate-600 mr-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Cards Grid */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
          <span className="text-xs font-bold">Loading client testimonials...</span>
        </div>
      ) : paginatedItems.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center p-8 bg-white rounded-3xl border border-slate-200">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
            <MessageSquareQuote className="w-8 h-8" />
          </div>
          <h3 className="text-base font-black text-slate-800">No Testimonials Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mt-1">
            {searchQuery
              ? `No reviews match "${searchQuery}". Try clearing search.`
              : "Click the '+ ADD TESTIMONIAL' button above to publish your first parent review."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginatedItems.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border transition-all flex flex-col justify-between p-5 shadow-xs hover:shadow-md relative overflow-hidden ${
                item.isActive ? "border-slate-200" : "border-slate-200/60 opacity-60 bg-slate-50/50"
              }`}
            >
              <div className="space-y-4">
                {/* Card Top: Stars & Status */}
                <div className="flex items-center justify-between">
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

                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                      item.isActive
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 text-slate-500 border border-slate-200"
                    }`}
                  >
                    {item.isActive ? "ACTIVE" : "INACTIVE"}
                  </span>
                </div>

                {/* Review Text */}
                <div className="relative">
                  <Quote className="w-5 h-5 text-blue-100 absolute -top-1 -left-1 pointer-events-none" />
                  <p className="text-xs text-slate-700 font-medium leading-relaxed pl-5 line-clamp-4 italic">
                    &quot;{item.text}&quot;
                  </p>
                </div>

                {/* Therapy Tag */}
                {item.service && (
                  <div>
                    <span className="inline-block px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-[10px] font-extrabold uppercase tracking-wide border border-blue-100">
                      {item.service}
                    </span>
                  </div>
                )}
              </div>

              {/* Card Footer: Author Profile & Actions */}
              <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 overflow-hidden relative shrink-0">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-black text-blue-600 text-xs">
                        {item.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-black text-slate-900 truncate">{item.name}</h4>
                    <p className="text-[10px] text-slate-500 font-bold truncate">{item.role}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors cursor-pointer"
                    title="Edit Review"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => triggerDelete(item.id)}
                    className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                    title="Delete Review"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && filtered.length > 0 && (
        <AdminPagination
          currentPage={currentPage}
          totalItems={filtered.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(val) => {
            setItemsPerPage(val);
            setCurrentPage(1);
          }}
          pageSizeOptions={[6, 9, 15, 30]}
        />
      )}

      {/* Add / Edit Modal (2-Column Architecture, Never Cut Off) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-xs">
          <div className="fixed inset-0" onClick={() => setIsModalOpen(false)} />

          <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-4xl max-h-[88vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 border border-slate-200 my-auto z-10">
            {/* Modal Header */}
            <div className="px-6 sm:px-8 py-4 sm:py-5 border-b border-slate-200 flex justify-between items-center bg-white shrink-0 sticky top-0 z-20">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600">
                  Client Testimonial
                </span>
                <h2 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
                  {selectedItem ? "Edit Testimonial" : "Add New Testimonial"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form id="testimonialForm" onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                      Parent / Client Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Priya & Rahul M."
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                      Relationship / Role *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      placeholder="e.g. Parents of 5-year-old Aarav"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                      Therapy Discipline / Program
                    </label>
                    <input
                      type="text"
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      placeholder="e.g. Speech & ABA Therapy"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  {/* Rating Selector */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                      Star Rating ({formData.rating} Stars)
                    </label>
                    <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-2xl">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFormData({ ...formData, rating: star })}
                          className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= formData.rating
                                ? "fill-amber-400 text-amber-400"
                                : "fill-slate-200 text-slate-200"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                        Display Order
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.displayOrder}
                        onChange={(e) =>
                          setFormData({ ...formData, displayOrder: parseInt(e.target.value, 10) || 1 })
                        }
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                        Website Status
                      </label>
                      <label className="flex items-center gap-2.5 p-3 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                          className="w-4 h-4 rounded-md text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-xs font-bold text-slate-800">Publish Active</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                      Testimonial Quote / Review Text *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.text}
                      onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                      placeholder="Write the full feedback or clinical milestone story here..."
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 leading-relaxed"
                    />
                  </div>

                  {/* Dual Image Upload Field */}
                  <ImageUploadField
                    label="Parent / Child Photo or Avatar"
                    value={formData.image}
                    onChange={(url) => setFormData({ ...formData, image: url })}
                  />
                </div>
              </div>
            </form>

            {/* Modal Footer */}
            <div className="px-8 py-4 border-t border-slate-200 flex justify-end gap-3 bg-slate-50 shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 border border-slate-200 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="testimonialForm"
                className="px-7 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
              >
                Save Testimonial
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Confirmation Modal */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={executeDelete}
        title="Delete Testimonial?"
        message="Are you sure you want to remove this client review from the live website? This action cannot be undone."
        itemCount={1}
      />
    </div>
  );
}
