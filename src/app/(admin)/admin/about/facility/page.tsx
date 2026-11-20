"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import ImageUploadField from "@/components/admin/ImageUploadField";
import ConfirmModal from "@/components/common/ConfirmModal";
import {
  Plus,
  Edit3,
  Trash2,
  X,
  Loader2,
  CheckCircle,
  Building,
  Save,
  CheckCircle2,
} from "lucide-react";

type StatusType = "ACTIVE" | "INACTIVE" | "DRAFT";

interface FacilityData {
  facilityHeading: string;
  facilityDesc: string;
  facilityImage: string;
  facilityPoints: string[];
  status: StatusType;
  updatedAt?: string;
}

const DEFAULT_POINTS = [
  "On-site large gymnasium area for gross motor skills, movement, and play.",
  "A dedicated life skills area to practice real-world daily routines (self-care, dressing, structured tasks).",
  "Sensory integration rooms equipped with swings, foam pits, and sensory regulation tools.",
  "Quiet 1:1 learning suites designed for focused ABA and Speech-Language sessions.",
];

export default function AdminAboutFacilityPage() {
  const [facility, setFacility] = useState<FacilityData>({
    facilityHeading: "Our Purpose-Built Facility & Spaces",
    facilityDesc:
      "Our Radiant Autism Services centre offers purpose-built space thoughtfully designed to support learning, sensory comfort, dignity, and child safety.",
    facilityImage: "/gallery_sensory_gym.jpg",
    facilityPoints: DEFAULT_POINTS,
    status: "ACTIVE",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Checkbox Selection & Bulk Actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal Form State
  const [formData, setFormData] = useState({
    facilityHeading: "",
    facilityDesc: "",
    facilityImage: "/gallery_sensory_gym.jpg",
    facilityPoints: [] as string[],
    status: "ACTIVE" as StatusType,
  });
  const [newPoint, setNewPoint] = useState("");

  const fetchFacilityData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/about");
      if (res.ok) {
        const data = await res.json();
        if (data.about) {
          let points = DEFAULT_POINTS;
          if (data.about.facilityPointsJson) {
            try {
              const p = JSON.parse(data.about.facilityPointsJson);
              if (Array.isArray(p) && p.length > 0) points = p;
            } catch (e) {
              console.error(e);
            }
          }

          setFacility({
            facilityHeading:
              data.about.facilityHeading || "Our Purpose-Built Facility & Spaces",
            facilityDesc:
              data.about.facilityDesc ||
              "Our Radiant Autism Services centre offers purpose-built space thoughtfully designed to support learning, sensory comfort, dignity, and child safety.",
            facilityImage: data.about.facilityImage || "/gallery_sensory_gym.jpg",
            facilityPoints: points,
            status: (data.about.status as StatusType) || "ACTIVE",
            updatedAt: data.about.updatedAt,
          });
        }
      }
    } catch (err) {
      console.error("Failed to load facility data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilityData();
  }, []);

  const openEditModal = () => {
    setFormData({
      facilityHeading: facility.facilityHeading,
      facilityDesc: facility.facilityDesc,
      facilityImage: facility.facilityImage || "/gallery_sensory_gym.jpg",
      facilityPoints: [...facility.facilityPoints],
      status: facility.status || "ACTIVE",
    });
    setNewPoint("");
    setSaveSuccess(false);
    setIsModalOpen(true);
  };

  const handleAddPoint = () => {
    if (!newPoint.trim()) return;
    setFormData((prev) => ({
      ...prev,
      facilityPoints: [...prev.facilityPoints, newPoint.trim()],
    }));
    setNewPoint("");
  };

  const handleRemovePoint = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      facilityPoints: prev.facilityPoints.filter((_, i) => i !== index),
    }));
  };

  const toggleSelectAll = () => {
    if (selectedIds.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(["facility-1"]);
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const cycleStatus = async () => {
    const nextStatus: StatusType =
      facility.status === "ACTIVE"
        ? "INACTIVE"
        : facility.status === "INACTIVE"
        ? "DRAFT"
        : "ACTIVE";

    try {
      const res = await fetch("/api/admin/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setFacility((prev) => ({ ...prev, status: nextStatus }));
      }
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  const executeDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch("/api/admin/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          facilityPoints: [],
          status: "INACTIVE",
        }),
      });
      if (res.ok) {
        setFacility((prev) => ({
          ...prev,
          facilityPoints: [],
          status: "INACTIVE",
        }));
        setSelectedIds([]);
        setIsConfirmOpen(false);
      }
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/admin/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          facilityHeading: formData.facilityHeading,
          facilityDesc: formData.facilityDesc,
          facilityImage: formData.facilityImage,
          facilityPoints: formData.facilityPoints,
          status: formData.status,
        }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        await fetchFacilityData();
        setTimeout(() => {
          setIsModalOpen(false);
          setSaveSuccess(false);
        }, 1200);
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || "Failed to save facility details");
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("Network error while saving");
    } finally {
      setIsSaving(false);
    }
  };

  const formatUpdatedAt = (dateStr?: string) => {
    if (!dateStr) return "Just now";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return dateStr;
    }
  };

  const renderStatusBadge = (st: StatusType) => {
    switch (st) {
      case "ACTIVE":
        return (
          <button
            type="button"
            onClick={cycleStatus}
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
            onClick={cycleStatus}
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
            onClick={cycleStatus}
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
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Facility Tour & Spaces
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Manage sensory gym, therapy rooms, equipment details, and facility bullet points
          </p>
        </div>

        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={() => setIsConfirmOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>Delete Selected ({selectedIds.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={openEditModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold uppercase tracking-wider shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Edit Facility Entry</span>
          </button>
        </div>
      </div>

      {/* Main Table View (FabFit Style) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">
              Loading Facility Content...
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 pl-6 pr-2 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </th>
                  <th className="py-4 px-4 w-12 text-center">#</th>
                  <th className="py-4 px-6">Facility Heading</th>
                  <th className="py-4 px-6">Description</th>
                  <th className="py-4 px-6">Showcase Photo</th>
                  <th className="py-4 px-6">Feature Points</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Updated At</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 pl-6 pr-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes("facility-1")}
                      onChange={() => toggleSelectOne("facility-1")}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </td>

                  <td className="py-4 px-4 font-bold text-slate-400 text-center">1</td>

                  <td className="py-4 px-6 font-black text-slate-900 max-w-xs">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="line-clamp-2">{facility.facilityHeading}</span>
                    </div>
                  </td>

                  <td className="py-4 px-6 font-medium text-slate-600 max-w-sm">
                    <p className="line-clamp-2 leading-relaxed whitespace-pre-line">{facility.facilityDesc}</p>
                  </td>

                  <td className="py-4 px-6">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative shrink-0">
                      <Image
                        src={facility.facilityImage || "/gallery_sensory_gym.jpg"}
                        alt="Facility Showcase"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    <span className="inline-block px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-[11px] font-extrabold border border-blue-100">
                      {facility.facilityPoints.length} Features Active
                    </span>
                  </td>

                  <td className="py-4 px-6">
                    {renderStatusBadge(facility.status)}
                  </td>

                  <td className="py-4 px-6 font-semibold text-slate-500">
                    {formatUpdatedAt(facility.updatedAt)}
                  </td>

                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={openEditModal}
                        title="Edit Facility Details"
                        className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200/80 transition-all inline-flex items-center justify-center font-bold cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsConfirmOpen(true)}
                        title="Delete"
                        className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 transition-all inline-flex items-center justify-center font-bold cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* POPUP MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-100">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  Edit Facility Tour & Spaces
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Update status, sensory gym heading, space description, photo, and key facility feature points.
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
              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                  Facility Heading *
                </label>
                <input
                  type="text"
                  required
                  value={formData.facilityHeading}
                  onChange={(e) => setFormData((prev) => ({ ...prev, facilityHeading: e.target.value }))}
                  placeholder="e.g. Our Purpose-Built Facility & Spaces"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                  Facility Description * (Press Enter for Paragraph Spacing)
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.facilityDesc}
                  onChange={(e) => setFormData((prev) => ({ ...prev, facilityDesc: e.target.value }))}
                  placeholder="Our Radiant Autism Services centre offers purpose-built space thoughtfully designed to support learning, sensory comfort, dignity, and child safety..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm leading-relaxed"
                />
              </div>

              {/* Facility Showcase Photo */}
              <ImageUploadField
                label="Facility Showcase Photo"
                value={formData.facilityImage}
                onChange={(url) => setFormData((prev) => ({ ...prev, facilityImage: url }))}
                placeholder="/gallery_sensory_gym.jpg"
                helpText="Upload a sensory gym or therapy suite photo from your computer."
              />

              {/* Facility Feature Points */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                    Facility Feature Points (Gym, Suites, Sensory Tools)
                  </label>
                  <span className="text-[11px] font-bold text-slate-400">
                    {formData.facilityPoints.length} Points
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newPoint}
                    onChange={(e) => setNewPoint(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddPoint();
                      }
                    }}
                    placeholder="Add a new facility feature point and press Enter..."
                    className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={handleAddPoint}
                    className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 shrink-0 cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {formData.facilityPoints.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 gap-3"
                    >
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 flex-1">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>{item}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemovePoint(idx)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Dropdown */}
              <div className="space-y-1.5 pt-3 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-800">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, status: e.target.value as StatusType }))
                  }
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="DRAFT">Draft</option>
                </select>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  {saveSuccess && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                      <CheckCircle className="w-4 h-4" />
                      Saved to Live Website!
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-extrabold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer ${
                      saveSuccess
                        ? "bg-emerald-600 text-white"
                        : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30"
                    }`}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : saveSuccess ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Saved!</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Facility</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETION MODAL */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={executeDelete}
        isDeleting={isDeleting}
        itemCount={selectedIds.length > 0 ? selectedIds.length : 1}
        title="Confirm Deletion"
        message="Are you sure you want to delete this? Please confirm to proceed."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
