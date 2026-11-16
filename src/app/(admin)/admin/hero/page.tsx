"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Plus,
  Edit3,
  Trash2,
  X,
  ImageIcon,
  Eye,
  Loader2,
  CheckCircle,
} from "lucide-react";
import AdminPagination from "@/components/common/AdminPagination";
import ConfirmModal from "@/components/common/ConfirmModal";
import RichTextEditor from "@/components/admin/RichTextEditor";

interface HeroSlide {
  id: string;
  badge?: string | null;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  primaryButtonText?: string | null;
  primaryButtonLink?: string | null;
  secondaryButtonText?: string | null;
  secondaryButtonLink?: string | null;
  backgroundImage?: string | null;
  foregroundImage?: string | null;
  status: "ACTIVE" | "INACTIVE" | "DRAFT";
  displayOrder: number;
  updatedAt: string;
}

export default function HeroAdminPage() {
  const [heroes, setHeroes] = useState<HeroSlide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHero, setSelectedHero] = useState<HeroSlide | null>(null);

  // Bulk Selection & Deletion State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | string[] | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Form State
  const [formData, setFormData] = useState({
    badge: "",
    title: "",
    subtitle: "",
    description: "",
    primaryButtonText: "",
    primaryButtonLink: "",
    secondaryButtonText: "",
    secondaryButtonLink: "",
    backgroundImage: "/hero_bg_aba.jpg",
    foregroundImage: "",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE" | "DRAFT",
    displayOrder: 1,
  });

  const fetchHeroes = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/hero");
      if (res.ok) {
        const data = await res.json();
        setHeroes(data.heroes || data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch heroes:", err);
    } finally {
      setIsLoading(false);
      setSelectedIds([]);
    }
  };

  useEffect(() => {
    fetchHeroes();
  }, []);

  const openAddModal = () => {
    setSelectedHero(null);
    setFormData({
      badge: "OAP COVERED & RBA SUPERVISED",
      title: "",
      subtitle: "",
      description: "",
      primaryButtonText: "Book Free Consultation",
      primaryButtonLink: "/contact",
      secondaryButtonText: "Explore Our Programs",
      secondaryButtonLink: "/services",
      backgroundImage: "/hero_bg_aba.jpg",
      foregroundImage: "",
      status: "ACTIVE",
      displayOrder: heroes.length + 1,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (hero: HeroSlide) => {
    setSelectedHero(hero);
    setFormData({
      badge: hero.badge || "",
      title: hero.title || "",
      subtitle: hero.subtitle || "",
      description: hero.description || "",
      primaryButtonText: hero.primaryButtonText || "",
      primaryButtonLink: hero.primaryButtonLink || "",
      secondaryButtonText: hero.secondaryButtonText || "",
      secondaryButtonLink: hero.secondaryButtonLink || "",
      backgroundImage: hero.backgroundImage || "/hero_bg_aba.jpg",
      foregroundImage: hero.foregroundImage || "",
      status: hero.status || "ACTIVE",
      displayOrder: hero.displayOrder || 1,
    });
    setIsModalOpen(true);
  };

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedIds.length === heroes.length && heroes.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(heroes.map((h) => h.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds((prev) => [...prev, id]);
    }
  };

  // Delete Triggers
  const triggerSingleDelete = (id: string) => {
    setDeleteTarget(id);
    setIsConfirmOpen(true);
  };

  const triggerBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setDeleteTarget(selectedIds);
    setIsConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;

    try {
      if (Array.isArray(deleteTarget)) {
        const res = await fetch("/api/admin/hero/bulk-delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: deleteTarget }),
        });
        if (res.ok) {
          setHeroes((prev) => prev.filter((h) => !deleteTarget.includes(h.id)));
          setSelectedIds([]);
        }
      } else {
        const res = await fetch(`/api/admin/hero/${deleteTarget}`, {
          method: "DELETE",
        });
        if (res.ok) {
          setHeroes((prev) => prev.filter((h) => h.id !== deleteTarget));
          setSelectedIds((prev) => prev.filter((id) => id !== deleteTarget));
        }
      }
    } catch (err) {
      console.error("Error deleting hero:", err);
    } finally {
      setDeleteTarget(null);
    }
  };

  // Save handler
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        displayOrder: parseInt(String(formData.displayOrder), 10) || 1,
      };

      let res;
      if (selectedHero) {
        res = await fetch(`/api/admin/hero/${selectedHero.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/admin/hero", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        setIsModalOpen(false);
        fetchHeroes();
      } else {
        const errData = await res.json();
        alert(`Failed to save: ${errData.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error saving hero slide:", err);
      alert("Failed to save hero slide");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black tracking-wider uppercase">
            ACTIVE
          </span>
        );
      case "INACTIVE":
        return (
          <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 border border-slate-300 text-[10px] font-black tracking-wider uppercase">
            INACTIVE
          </span>
        );
      case "DRAFT":
        return (
          <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-black tracking-wider uppercase">
            DRAFT
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-300 text-[10px] font-black tracking-wider uppercase">
            {status}
          </span>
        );
    }
  };

  // Paginated Slicing
  const sortedHeroes = [...heroes].sort((a, b) => a.displayOrder - b.displayOrder);
  const totalItems = sortedHeroes.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedHeroes = sortedHeroes.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="flex flex-col h-full gap-5 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Hero Section</h1>
          <p className="text-slate-500 text-xs font-medium mt-1">
            Manage website hero carousel slides. Admin can create unlimited slides and set active status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && (
            <button
              onClick={triggerBulkDelete}
              className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 font-bold text-xs shadow-xs transition-colors border border-rose-200"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Selected ({selectedIds.length})</span>
            </button>
          )}

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-extrabold text-xs uppercase tracking-wider shadow-md shadow-blue-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Hero</span>
          </button>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-3xl shadow-xs border border-slate-200/90 flex flex-col overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase text-[11px] font-black tracking-wider">
              <tr>
                <th className="py-4 pl-6 pr-2 w-10">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    checked={heroes.length > 0 && selectedIds.length === heroes.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="py-4 px-6 text-slate-500 w-16">#</th>
                <th className="py-4 px-6">Title</th>
                <th className="py-4 px-6">Subtitle</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Order</th>
                <th className="py-4 px-6">Updated At</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400 font-medium">
                    <Loader2 className="w-6 h-6 text-blue-600 animate-spin mx-auto mb-2" />
                    <span>Loading Hero Slides...</span>
                  </td>
                </tr>
              ) : heroes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-500 font-medium">
                    No hero slides found. Click &quot;Add Hero&quot; to create your first slide.
                  </td>
                </tr>
              ) : (
                paginatedHeroes.map((hero, index) => {
                  const globalIndex = startIndex + index + 1;
                  const isSelected = selectedIds.includes(hero.id);

                  return (
                    <tr
                      key={hero.id}
                      className={`hover:bg-blue-50/30 transition-colors ${
                        isSelected ? "bg-blue-50/60" : ""
                      }`}
                    >
                      <td className="py-4 pl-6 pr-2">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(hero.id)}
                        />
                      </td>
                      <td className="py-4 px-6 text-slate-400 font-bold">{globalIndex}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="relative w-16 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                            <img
                              src={hero.backgroundImage || "/hero_bg_aba.jpg"}
                              alt={hero.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900 line-clamp-1 max-w-[240px]">
                              {hero.title}
                            </div>
                            {hero.badge && (
                              <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                                {hero.badge}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-600 font-medium max-w-[220px] truncate">
                        {hero.subtitle || "-"}
                      </td>
                      <td className="py-4 px-6">{getStatusBadge(hero.status)}</td>
                      <td className="py-4 px-6 font-mono font-bold text-slate-800">
                        #{hero.displayOrder}
                      </td>
                      <td className="py-4 px-6 text-slate-500 font-medium">
                        {new Date(hero.updatedAt).toLocaleDateString("en-CA", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(hero)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-xl transition-colors"
                            title="Edit Slide"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => triggerSingleDelete(hero.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors"
                            title="Delete Slide"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Global Pagination Component */}
        <AdminPagination
          currentPage={currentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(size) => {
            setItemsPerPage(size);
            setCurrentPage(1);
          }}
          pageSizeOptions={[5, 10, 20, 50]}
        />
      </div>

      {/* FabFit Style 2-Column Modal (NEVER CUT OFF AT TOP OR BOTTOM!) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs">
          <div
            className="absolute inset-0"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 border border-slate-200">
            {/* Fixed Modal Header */}
            <div className="px-8 py-5 border-b border-slate-200 flex justify-between items-center bg-white shrink-0">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600">
                  Hero Carousel Slide
                </span>
                <h2 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
                  {selectedHero ? "Edit Hero Slide" : "Add New Hero Slide"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body (2-Column Architecture) */}
            <form id="heroForm" onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                      Badge / Pill Tag
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. OAP COVERED & RBA SUPERVISED"
                      value={formData.badge}
                      onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                      Slide Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ABA Therapy (Applied Behavior Analysis)"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                      Subtitle
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Personalized, evidence-based, and compassionate interventions."
                      value={formData.subtitle}
                      onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                      Description (Rich Text)
                    </label>
                    <RichTextEditor
                      value={formData.description}
                      onChange={(val) => setFormData({ ...formData, description: val })}
                      placeholder="Enter detailed clinical support details..."
                      minHeight="140px"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                        Primary Button Text
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Book Consultation"
                        value={formData.primaryButtonText}
                        onChange={(e) =>
                          setFormData({ ...formData, primaryButtonText: e.target.value })
                        }
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                        Primary Button Link
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. /contact"
                        value={formData.primaryButtonLink}
                        onChange={(e) =>
                          setFormData({ ...formData, primaryButtonLink: e.target.value })
                        }
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-700 text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                        Secondary Button Text
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Our Services"
                        value={formData.secondaryButtonText}
                        onChange={(e) =>
                          setFormData({ ...formData, secondaryButtonText: e.target.value })
                        }
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                        Secondary Button Link
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. /services"
                        value={formData.secondaryButtonLink}
                        onChange={(e) =>
                          setFormData({ ...formData, secondaryButtonLink: e.target.value })
                        }
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-700 text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                      Background Image Path / URL *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. /hero_bg_aba.jpg or https://..."
                      value={formData.backgroundImage}
                      onChange={(e) =>
                        setFormData({ ...formData, backgroundImage: e.target.value })
                      }
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-slate-800"
                    />

                    {/* Image Preview Box */}
                    <div className="relative aspect-16/9 w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 mt-2">
                      <img
                        src={formData.backgroundImage || "/hero_bg_aba.jpg"}
                        alt="Hero preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex items-end p-3">
                        <span className="text-white text-[10px] font-bold">
                          Live Slide Preview
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                        Slide Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            status: e.target.value as "ACTIVE" | "INACTIVE" | "DRAFT",
                          })
                        }
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 cursor-pointer"
                      >
                        <option value="ACTIVE">ACTIVE (Live on Homepage)</option>
                        <option value="INACTIVE">INACTIVE (Hidden)</option>
                        <option value="DRAFT">DRAFT</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                        Display Order
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.displayOrder}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            displayOrder: parseInt(e.target.value, 10) || 1,
                          })
                        }
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-mono font-bold text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </form>

            {/* Fixed Modal Footer */}
            <div className="px-8 py-4 border-t border-slate-200 flex justify-end gap-3 bg-slate-50 shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 border border-slate-200 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="heroForm"
                className="px-7 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-600/30 transition-all"
              >
                Save Hero
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
        title="Delete Hero Slide?"
        message="Are you sure you want to delete this hero carousel slide? This action cannot be undone."
        itemCount={Array.isArray(deleteTarget) ? deleteTarget.length : 1}
      />
    </div>
  );
}
