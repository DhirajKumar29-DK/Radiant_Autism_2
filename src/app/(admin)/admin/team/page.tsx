"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Users,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  X,
  Save,
  Award,
} from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  badge?: string | null;
  image?: string | null;
  bio?: string | null;
  order: number;
  isActive: boolean;
}

export default function AdminTeamPage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalMode, setModalMode] = useState<"ADD" | "EDIT" | null>(null);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    badge: "Clinical Specialist",
    image: "/founder_portrait.jpg",
    bio: "",
    order: 0,
    isActive: true,
  });

  const fetchTeam = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/team");
      if (res.ok) {
        const data = await res.json();
        setTeam(data.team || []);
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
      order: team.length + 1,
      isActive: true,
    });
    setEditingMember(null);
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
      order: member.order || 0,
      isActive: member.isActive,
    });
    setModalMode("EDIT");
  };

  const handleToggleActive = async (member: TeamMember) => {
    try {
      const updatedStatus = !member.isActive;
      const res = await fetch(`/api/admin/team/${member.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: updatedStatus }),
      });
      if (res.ok) {
        setTeam((prev) =>
          prev.map((item) => (item.id === member.id ? { ...item, isActive: updatedStatus } : item))
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
        const res = await fetch("/api/admin/team", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          fetchTeam();
          setModalMode(null);
        } else {
          alert("Failed to create team member");
        }
      } else if (modalMode === "EDIT" && editingMember) {
        const res = await fetch(`/api/admin/team/${editingMember.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          fetchTeam();
          setModalMode(null);
        } else {
          alert("Failed to update team member");
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
      const res = await fetch(`/api/admin/team/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setTeam((prev) => prev.filter((item) => item.id !== id));
        setDeleteConfirmId(null);
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
              Clinical Team & Specialists
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-extrabold text-xs">
              {team.length} Staff Members
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Manage your Registered Behaviour Analysts (RBA), Speech Pathologists, Occupational Therapists, and Behavior Technicians.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold rounded-2xl shadow-lg shadow-blue-600/30 transition-all uppercase tracking-wider"
        >
          <Plus className="w-4 h-4" />
          <span>Add Clinical Staff</span>
        </button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">
            Loading Clinical Staff...
          </p>
        </div>
      ) : team.length === 0 ? (
        <div className="bg-white p-16 rounded-3xl border border-slate-200 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="text-slate-900 font-bold text-base">No Clinical Staff Listed</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
            Add your clinical director, behavior analysts, and therapy team members here.
          </p>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
          >
            Add First Staff Member
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((member) => (
            <div
              key={member.id}
              className={`bg-white rounded-3xl border transition-all overflow-hidden flex flex-col justify-between ${
                member.isActive
                  ? "border-slate-200/90 shadow-xs hover:shadow-md hover:border-blue-400"
                  : "border-slate-200 opacity-60 bg-slate-50/50"
              }`}
            >
              {/* Photo & Badge */}
              <div className="relative h-60 w-full bg-slate-100 overflow-hidden group">
                <Image
                  src={member.image || "/founder_portrait.jpg"}
                  alt={member.name}
                  fill
                  className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                <div className="absolute top-3 right-3">
                  <button
                    onClick={() => handleToggleActive(member)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm backdrop-blur-md ${
                      member.isActive
                        ? "bg-emerald-500/90 text-white"
                        : "bg-rose-500/90 text-white"
                    }`}
                  >
                    {member.isActive ? (
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
                  {member.badge && (
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-500/90 text-white text-[9px] font-black uppercase tracking-wider mb-1 shadow-xs">
                      {member.badge}
                    </span>
                  )}
                  <h3 className="font-black text-base line-clamp-1">{member.name}</h3>
                  <p className="text-xs text-blue-200 font-bold line-clamp-1">{member.role}</p>
                </div>
              </div>

              {/* Bio & Actions */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between text-xs">
                <p className="text-slate-600 font-medium line-clamp-3 leading-relaxed">
                  {member.bio || "No biography details provided."}
                </p>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400 font-bold">
                    Order #{member.order}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(member)}
                      className="p-1.5 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Edit Staff Member"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(member.id)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete Staff Member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
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
              <h3 className="font-extrabold text-slate-900 text-base">Remove Staff Member?</h3>
              <p className="text-xs text-slate-500 font-medium">
                This clinical team profile will be permanently deleted from the database.
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
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600">
                  {modalMode === "ADD" ? "New Clinical Clinician" : "Edit Clinician Profile"}
                </span>
                <h2 className="text-xl font-black text-slate-900 tracking-tight mt-1">
                  {modalMode === "ADD" ? "Add Clinical Staff Member" : `Edit: ${formData.name}`}
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
                  Full Name & Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Jesenia Duran, RBA"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                    Clinical Role / Position *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.role}
                    onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
                    placeholder="e.g. Clinical Director & Lead RBA"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                    Clinical Credential Badge
                  </label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData((prev) => ({ ...prev, badge: e.target.value }))}
                    placeholder="e.g. Registered Behaviour Analyst (Ontario)"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                    Portrait Photo Path or URL
                  </label>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData((prev) => ({ ...prev, image: e.target.value }))}
                    placeholder="e.g. /founder_portrait.jpg"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

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
              </div>

              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                  Clinical Biography & Credentials
                </label>
                <textarea
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                  placeholder="Detail years of experience, university credentials, certifications, specialties..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="activeMemberToggle"
                  checked={formData.isActive}
                  onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <label htmlFor="activeMemberToggle" className="font-bold text-slate-800 cursor-pointer">
                  Display profile on public website team roster
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
                  <span>{modalMode === "ADD" ? "Add Clinician" : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
