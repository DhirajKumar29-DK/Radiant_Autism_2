"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Users,
  Plus,
  Edit3,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  X,
  Save,
  CheckCircle2,
  Award,
} from "lucide-react";
import AdminPagination from "@/components/common/AdminPagination";
import ConfirmModal from "@/components/common/ConfirmModal";
import ImageUploadField from "@/components/admin/ImageUploadField";

type StatusType = "ACTIVE" | "INACTIVE" | "DRAFT";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  badge?: string | null;
  image?: string | null;
  bio?: string | null;
  instagram?: string | null;
  order: number;
  status: StatusType;
  isActive: boolean;
  updatedAt?: string;
  createdAt?: string;
}

export default function AdminTeamPage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalMode, setModalMode] = useState<"ADD" | "EDIT" | null>(null);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Selection & Bulk Action
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [deleteTargetIds, setDeleteTargetIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  // Form State inside Modal
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    badge: "Clinical Specialist",
    image: "/founder_portrait.jpg",
    bio: "",
    instagram: "",
    order: 0,
    status: "ACTIVE" as StatusType,
  });

  const fetchTeam = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/team");
      if (res.ok) {
        const data = await res.json();
        const mapped: TeamMember[] = (data.team || []).map((m: any) => ({
          ...m,
          status: (m.status as StatusType) || (m.isActive ? "ACTIVE" : "INACTIVE"),
        }));
        setTeam(mapped);
      }
    } catch (err) {
      console.error("Failed to load team:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const openAddModal = () => {
    setFormData({
      name: "",
      role: "",
      badge: "Clinical Specialist",
      image: "/founder_portrait.jpg",
      bio: "",
      instagram: "",
      order: team.length + 1,
      status: "ACTIVE",
    });
    setEditingMember(null);
    setSaveSuccess(false);
    setModalMode("ADD");
  };

  const openEditModal = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      role: member.role,
      badge: member.badge || "",
      image: member.image || "/founder_portrait.jpg",
      bio: member.bio || "",
      instagram: member.instagram || "",
      order: member.order || 0,
      status: member.status || (member.isActive ? "ACTIVE" : "INACTIVE"),
    });
    setSaveSuccess(false);
    setModalMode("EDIT");
  };

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedTeam.length && paginatedTeam.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedTeam.map((m) => m.id));
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
  const cycleStatus = async (member: TeamMember) => {
    const nextStatus: StatusType =
      member.status === "ACTIVE"
        ? "INACTIVE"
        : member.status === "INACTIVE"
        ? "DRAFT"
        : "ACTIVE";

    try {
      const res = await fetch(`/api/admin/team/${member.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setTeam((prev) =>
          prev.map((item) =>
            item.id === member.id
              ? { ...item, status: nextStatus, isActive: nextStatus === "ACTIVE" }
              : item
          )
        );
      }
    } catch (err) {
      console.error("Status toggle error:", err);
    }
  };

  // Trigger Delete confirmation for single or bulk
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
        const res = await fetch(`/api/admin/team/${id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          setTeam((prev) => prev.filter((item) => item.id !== id));
          setSelectedIds((prev) => prev.filter((item) => item !== id));
        }
      } else {
        const res = await fetch("/api/admin/team", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: deleteTargetIds }),
        });
        if (res.ok) {
          setTeam((prev) => prev.filter((item) => !deleteTargetIds.includes(item.id)));
          setSelectedIds([]);
        }
      }
      setIsConfirmDeleteOpen(false);
      setDeleteTargetIds([]);
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting team member(s)");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSaveSuccess(false);

    try {
      if (modalMode === "ADD") {
        const res = await fetch("/api/admin/team", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          setSaveSuccess(true);
          await fetchTeam();
          setTimeout(() => {
            setModalMode(null);
            setSaveSuccess(false);
          }, 1000);
        } else {
          const err = await res.json().catch(() => ({}));
          alert(err.error || "Failed to create team member");
        }
      } else if (modalMode === "EDIT" && editingMember) {
        const res = await fetch(`/api/admin/team/${editingMember.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          setSaveSuccess(true);
          await fetchTeam();
          setTimeout(() => {
            setModalMode(null);
            setSaveSuccess(false);
          }, 1000);
        } else {
          const err = await res.json().catch(() => ({}));
          alert(err.error || "Failed to update team member");
        }
      }
    } catch (err) {
      console.error("Submit error:", err);
      alert("Network or server error");
    } finally {
      setIsSubmitting(false);
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
      });
    } catch {
      return dateStr;
    }
  };

  const renderStatusBadge = (st: StatusType, member: TeamMember) => {
    switch (st) {
      case "ACTIVE":
        return (
          <button
            type="button"
            onClick={() => cycleStatus(member)}
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
            onClick={() => cycleStatus(member)}
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
            onClick={() => cycleStatus(member)}
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

  // Paginated records
  const totalItems = team.length;
  const paginatedTeam = team.slice(
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
              Clinical Leadership & Team
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-extrabold text-xs">
              {team.length} Clinicians
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Manage your Registered Behaviour Analysts (RBA), Speech Pathologists, Occupational Therapists, and Behavior Technicians.
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
            <span>Add Clinical Staff</span>
          </button>
        </div>
      </div>

      {/* Main Table View (FabFit Style with Select All & Actions) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">
              Loading Clinical Team...
            </p>
          </div>
        ) : team.length === 0 ? (
          <div className="bg-white p-16 rounded-3xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="text-slate-900 font-bold text-base">No Clinical Staff Listed</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
              Add your clinical director, behavior analysts, and therapy team members here.
            </p>
            <button
              type="button"
              onClick={openAddModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
            >
              Add First Staff Member
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
                        paginatedTeam.length > 0 &&
                        paginatedTeam.every((m) => selectedIds.includes(m.id))
                      }
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </th>
                  <th className="py-4 px-3 w-12 text-center">#</th>
                  <th className="py-4 px-6">Clinician</th>
                  <th className="py-4 px-6">Role & Title</th>
                  <th className="py-4 px-6">Specialty Badge</th>
                  <th className="py-4 px-6">Instagram</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Updated</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {paginatedTeam.map((member, idx) => {
                  const rowNumber = (currentPage - 1) * itemsPerPage + idx + 1;
                  const isSelected = selectedIds.includes(member.id);

                  return (
                    <tr
                      key={member.id}
                      className={`hover:bg-slate-50/50 transition-colors ${
                        isSelected ? "bg-blue-50/30" : ""
                      }`}
                    >
                      <td className="py-4 pl-6 pr-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(member.id)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>

                      <td className="py-4 px-3 font-bold text-slate-400 text-center">
                        {rowNumber}
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 relative shrink-0">
                            <Image
                              src={member.image || "/founder_portrait.jpg"}
                              alt={member.name}
                              fill
                              className="object-cover object-top"
                            />
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900">{member.name}</p>
                            <p className="text-[11px] text-slate-400 font-medium line-clamp-1">
                              Order: {member.order}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 font-bold text-slate-700 max-w-xs">
                        <p className="line-clamp-2">{member.role}</p>
                      </td>

                      <td className="py-4 px-6">
                        {member.badge ? (
                          <span className="inline-block px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-[11px] font-extrabold border border-blue-100">
                            {member.badge}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium">—</span>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        {member.instagram ? (
                          <a
                            href={
                              member.instagram.startsWith("http")
                                ? member.instagram
                                : `https://instagram.com/${member.instagram.replace(/^@/, "")}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-pink-50 text-pink-700 hover:bg-pink-100 border border-pink-200/60 font-bold text-[11px] transition-colors"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                            <span>
                              {member.instagram.startsWith("http")
                                ? `@${member.instagram.split("/").filter(Boolean).pop()}`
                                : member.instagram}
                            </span>
                          </a>
                        ) : (
                          <span className="text-slate-400 font-medium">—</span>
                        )}
                      </td>

                      {/* Dynamic Status with Quick Cycle */}
                      <td className="py-4 px-6">
                        {renderStatusBadge(member.status, member)}
                      </td>

                      <td className="py-4 px-6 font-semibold text-slate-500">
                        {formatUpdatedAt(member.updatedAt || member.createdAt)}
                      </td>

                      {/* Dual Action: Edit + Delete */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(member)}
                            title="Edit Clinician"
                            className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200/80 transition-all inline-flex items-center gap-1.5 font-bold cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                            <span className="text-[11px]">Edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => confirmSingleDelete(member.id)}
                            title="Soft Delete Clinician"
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
                  {modalMode === "ADD" ? "Add Clinical Staff Member" : "Edit Clinician Profile"}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Update credentials, portrait photo, clinical role, Instagram profile, and bio.
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
              {/* Name & Role */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Dr. Sarah Jenkins, BCBA-D"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                    Clinical Role / Designation *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.role}
                    onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
                    placeholder="e.g. Registered Behaviour Analyst (RBA)"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                  />
                </div>
              </div>

              {/* Specialty Badge & Instagram */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                    Specialty Tag / Badge
                  </label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData((prev) => ({ ...prev, badge: e.target.value }))}
                    placeholder="e.g. Clinical Director, Senior RBA"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                    Instagram Handle or URL
                  </label>
                  <input
                    type="text"
                    value={formData.instagram}
                    onChange={(e) => setFormData((prev) => ({ ...prev, instagram: e.target.value }))}
                    placeholder="e.g. @sarah_aba or https://instagram.com/..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                  />
                </div>
              </div>

              {/* Portrait Image (Dual-mode upload: File / URL) */}
              <ImageUploadField
                label="Clinician Portrait Photo"
                value={formData.image}
                onChange={(url) => setFormData((prev) => ({ ...prev, image: url }))}
                recommendedSize="800 x 1000px (Portrait 4:5)"
              />

              {/* Order */}
              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                  Sort / Display Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, order: parseInt(e.target.value) || 0 }))
                  }
                  className="w-32 p-3 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                />
              </div>

              {/* Bio / Description */}
              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                  Detailed Biography / Clinical Focus
                </label>
                <textarea
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                  placeholder="Describe clinician's credentials, years of experience, specialized therapy domains, and passion for pediatric developmental care..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm leading-relaxed"
                />
              </div>

              {/* Status DDL (Publish or Draft at bottom of form) */}
              <div className="space-y-1.5 pt-3 border-t border-slate-100">
                <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                  Staff Visibility Status (Publish or Draft)
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
                        <span>{modalMode === "ADD" ? "Add Staff Member" : "Save Changes"}</span>
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
            ? `Delete ${deleteTargetIds.length} Staff Members?`
            : "Delete Clinician Profile?"
        }
        message={
          deleteTargetIds.length > 1
            ? `Are you sure you want to soft delete the selected ${deleteTargetIds.length} clinicians? They will be deactivated and removed from public view.`
            : "Are you sure you want to soft delete this clinician? Their profile will be hidden from the website."
        }
        confirmText={
          isDeleting
            ? "Deleting..."
            : deleteTargetIds.length > 1
            ? `Delete ${deleteTargetIds.length} Members`
            : "Delete Clinician"
        }
        variant="danger"
      />
    </div>
  );
}
