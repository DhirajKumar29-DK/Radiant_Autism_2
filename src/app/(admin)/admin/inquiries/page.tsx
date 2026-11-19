"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Calendar,
  Search,
  Download,
  Filter,
  Phone,
  Mail,
  Trash2,
  Clock,
  Eye,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  Save,
  Loader2,
  User,
  Activity,
  Check,
} from "lucide-react";
import AdminPagination from "@/components/common/AdminPagination";
import ConfirmModal from "@/components/common/ConfirmModal";

interface Appointment {
  id: string;
  ticketId: string;
  fullName: string;
  email: string;
  phone?: string | null;
  service: string;
  preferredDate: string;
  preferredTime?: string | null;
  message?: string | null;
  status: "NEW" | "CONTACTED" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  notes?: string | null;
  createdAt: string;
}

interface Counts {
  all: number;
  new: number;
  contacted: number;
  confirmed: number;
  completed: number;
  cancelled: number;
}

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Appointment[]>([]);
  const [counts, setCounts] = useState<Counts>({
    all: 0,
    new: 0,
    contacted: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
  });
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedInquiry, setSelectedInquiry] = useState<Appointment | null>(null);
  const [editNotes, setEditNotes] = useState<string>("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const [isSavingNotes, setIsSavingNotes] = useState<boolean>(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [inquiryToDelete, setInquiryToDelete] = useState<Appointment | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch inquiries from API
  const fetchInquiries = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTab !== "ALL") params.append("status", activeTab);
      if (debouncedSearch) params.append("search", debouncedSearch);

      const res = await fetch(`/api/admin/inquiries?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setInquiries(data.inquiries || []);
        if (data.counts) setCounts(data.counts);
      }
    } catch (err) {
      console.error("Failed to load inquiries:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [activeTab, debouncedSearch]);

  // Open details modal
  const handleOpenDetail = (inquiry: Appointment) => {
    setSelectedInquiry(inquiry);
    setEditNotes(inquiry.notes || "");
  };

  // Update Status
  const handleStatusChange = async (id: string, newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const data = await res.json();
        setInquiries((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: data.inquiry.status } : item))
        );
        if (selectedInquiry && selectedInquiry.id === id) {
          setSelectedInquiry((prev) => (prev ? { ...prev, status: data.inquiry.status } : null));
        }
        // Update counts
        fetchInquiries();
      }
    } catch (err) {
      console.error("Status update error:", err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Save Clinical Staff Notes
  const handleSaveNotes = async () => {
    if (!selectedInquiry) return;
    setIsSavingNotes(true);
    try {
      const res = await fetch(`/api/admin/inquiries/${selectedInquiry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: editNotes }),
      });
      if (res.ok) {
        const data = await res.json();
        setInquiries((prev) =>
          prev.map((item) => (item.id === selectedInquiry.id ? { ...item, notes: data.inquiry.notes } : item))
        );
        setSelectedInquiry((prev) => (prev ? { ...prev, notes: data.inquiry.notes } : null));
      }
    } catch (err) {
      console.error("Error saving notes:", err);
    } finally {
      setIsSavingNotes(false);
    }
  };

  // Delete Inquiry
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/inquiries`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setInquiries((prev) => prev.filter((item) => item.id !== id));
        if (selectedInquiry?.id === id) setSelectedInquiry(null);
        fetchInquiries();
      }
    } catch (err) {
      console.error("Error deleting inquiry:", err);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (inquiries.length === 0) return;

    const headers = [
      "Ticket ID",
      "Full Name",
      "Email",
      "Phone",
      "Service Requested",
      "Preferred Date",
      "Preferred Time (EST)",
      "Status",
      "Clinical Notes",
      "Created At",
    ];

    const rows = inquiries.map((i) => [
      i.ticketId,
      `"${i.fullName.replace(/"/g, '""')}"`,
      i.email,
      i.phone || "",
      `"${i.service.replace(/"/g, '""')}"`,
      i.preferredDate,
      i.preferredTime || "",
      i.status,
      `"${(i.notes || "").replace(/"/g, '""')}"`,
      new Date(i.createdAt).toLocaleString(),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `radiant_consultation_inquiries_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "NEW":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "CONTACTED":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "CONFIRMED":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "COMPLETED":
        return "bg-slate-100 text-slate-800 border-slate-200";
      case "CANCELLED":
        return "bg-rose-100 text-rose-800 border-rose-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Inquiries & Consultations Desk
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-extrabold text-xs">
              {counts.all} Total
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Review parent inquiries, update consultation intake status, and manage clinical follow-ups.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={inquiries.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-2xl shadow-xs transition-colors disabled:opacity-50"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {[
              { id: "ALL", label: "All Consultations", count: counts.all },
              { id: "NEW", label: "New (Action Required)", count: counts.new, highlight: true },
              { id: "CONTACTED", label: "Contacted", count: counts.contacted },
              { id: "CONFIRMED", label: "Confirmed", count: counts.confirmed },
              { id: "COMPLETED", label: "Completed", count: counts.completed },
              { id: "CANCELLED", label: "Cancelled", count: counts.cancelled },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                  activeTab === tab.id
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                    activeTab === tab.id
                      ? "bg-slate-700 text-white"
                      : tab.highlight && tab.count > 0
                      ? "bg-blue-600 text-white animate-pulse"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search parent, phone, ticket..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">
              Loading Consultation Requests...
            </p>
          </div>
        ) : inquiries.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-slate-800 text-sm font-bold">No Inquiries Found</h3>
            <p className="text-slate-500 text-xs max-w-sm mx-auto font-medium">
              {debouncedSearch
                ? `No records match your search query "${debouncedSearch}".`
                : "No inquiries under this status category at the moment."}
            </p>
          </div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-black border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-6">Ticket</th>
                    <th className="py-3.5 px-6">Parent / Guardian</th>
                    <th className="py-3.5 px-6">Service Requested</th>
                    <th className="py-3.5 px-6">Appointment Date</th>
                    <th className="py-3.5 px-6">Time (EST)</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {inquiries.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((appt) => (
                    <tr
                      key={appt.id}
                      className="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                      onClick={() => handleOpenDetail(appt)}
                    >
                      <td className="py-4 px-6 font-mono font-bold text-blue-700">
                        #{appt.ticketId}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {appt.fullName}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {appt.email}
                          </span>
                          {appt.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {appt.phone}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-xl">
                          {appt.service}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-700">
                        {appt.preferredDate}
                      </td>
                      <td className="py-4 px-6 text-slate-600">
                        {appt.preferredTime ? `${appt.preferredTime} EST` : "Flexible"}
                      </td>
                      <td className="py-4 px-6" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={appt.status}
                          onChange={(e) => handleStatusChange(appt.id, e.target.value)}
                          className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none ${getStatusBadge(
                            appt.status
                          )}`}
                        >
                          <option value="NEW">NEW</option>
                          <option value="CONTACTED">CONTACTED</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="COMPLETED">COMPLETED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>
                      <td
                        className="py-4 px-6 text-right space-x-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => handleOpenDetail(appt)}
                          title="View Details"
                          className="p-1.5 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setInquiryToDelete(appt);
                            setIsDeleteOpen(true);
                          }}
                          title="Delete"
                          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <AdminPagination
              currentPage={currentPage}
              totalItems={inquiries.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(val) => {
                setItemsPerPage(val);
                setCurrentPage(1);
              }}
            />
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setInquiryToDelete(null);
        }}
        onConfirm={async () => {
          if (inquiryToDelete) {
            await handleDelete(inquiryToDelete.id);
            setIsDeleteOpen(false);
            setInquiryToDelete(null);
          }
        }}
        title="Confirm Deletion"
        message={`Are you sure you want to delete inquiry ticket #${inquiryToDelete?.ticketId} from ${inquiryToDelete?.fullName}? Please confirm to proceed.`}
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Detail & Intake Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 sm:px-8 py-5 border-b border-slate-200 flex items-start justify-between bg-white shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-700 font-mono font-bold text-xs">
                    #{selectedInquiry.ticketId}
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusBadge(
                      selectedInquiry.status
                    )}`}
                  >
                    {selectedInquiry.status}
                  </span>
                </div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight mt-2">
                  {selectedInquiry.fullName}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Received on {new Date(selectedInquiry.createdAt).toLocaleString()}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedInquiry(null)}
                className="p-2 rounded-2xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">

            {/* Quick Contact & Action Bar */}
            <div className="flex flex-wrap items-center gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70">
              <a
                href={`mailto:${selectedInquiry.email}`}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-blue-400 text-blue-600 text-xs font-bold shadow-xs transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email Parent ({selectedInquiry.email})</span>
              </a>

              {selectedInquiry.phone && (
                <a
                  href={`tel:${selectedInquiry.phone}`}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-emerald-400 text-emerald-600 text-xs font-bold shadow-xs transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call ({selectedInquiry.phone})</span>
                </a>
              )}
            </div>

            {/* Consultation Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Target Program
                </span>
                <p className="font-extrabold text-slate-800 text-sm">{selectedInquiry.service}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Preferred Schedule (EST)
                </span>
                <p className="font-extrabold text-slate-800 text-sm">
                  {selectedInquiry.preferredDate} —{" "}
                  {selectedInquiry.preferredTime ? `${selectedInquiry.preferredTime} EST` : "Flexible"}
                </p>
              </div>
            </div>

            {/* Parent's Message */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Parent Inquiry Message</span>
              </label>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 text-xs italic font-medium leading-relaxed">
                {selectedInquiry.message || "No custom message provided with this submission."}
              </div>
            </div>

            {/* Clinical Staff Internal Notes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-blue-600" />
                  <span>Clinical Intake Notes (Internal Only)</span>
                </label>
                <button
                  onClick={handleSaveNotes}
                  disabled={isSavingNotes}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {isSavingNotes ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>Save Notes</span>
                </button>
              </div>
              <textarea
                rows={3}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Log consultation calls, diagnosis history, child's age, insurance notes..."
                className="w-full p-3 bg-white border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Status Change Buttons */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Update Status
              </label>
              <div className="flex flex-wrap gap-2">
                {(["NEW", "CONTACTED", "CONFIRMED", "COMPLETED", "CANCELLED"] as const).map(
                  (statusOption) => (
                    <button
                      key={statusOption}
                      disabled={isUpdatingStatus}
                      onClick={() => handleStatusChange(selectedInquiry.id, statusOption)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all border ${
                        selectedInquiry.status === statusOption
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {statusOption}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Modal Footer (Sticky) */}
          <div className="px-6 sm:px-8 py-4 border-t border-slate-200 flex justify-end bg-slate-50 shrink-0">
            <button
              type="button"
              onClick={() => setSelectedInquiry(null)}
              className="px-5 py-2.5 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors"
            >
              Close Details
            </button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
}
