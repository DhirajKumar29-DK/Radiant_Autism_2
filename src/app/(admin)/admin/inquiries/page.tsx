"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Calendar,
  Search,
  Download,
  Phone,
  Mail,
  Trash2,
  Clock,
  Eye,
  CheckCircle2,
  X,
  FileText,
  Save,
  Loader2,
  User,
  Activity,
  Check,
  RotateCw,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import ConfirmModal from "@/components/common/ConfirmModal";
import AdminPagination from "@/components/common/AdminPagination";

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

function AdminInquiriesContent() {
  const searchParams = useSearchParams();
  const ticketParam = searchParams?.get("ticket") || searchParams?.get("search") || "";
  const [hasAutoOpened, setHasAutoOpened] = useState(false);

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
  const [searchTerm, setSearchTerm] = useState<string>(ticketParam);
  const [debouncedSearch, setDebouncedSearch] = useState<string>(ticketParam);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [selectedInquiry, setSelectedInquiry] = useState<Appointment | null>(null);
  const [editNotes, setEditNotes] = useState<string>("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const [isSavingNotes, setIsSavingNotes] = useState<boolean>(false);
  const [saveNotesSuccess, setSaveNotesSuccess] = useState<boolean>(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [inquiryToDelete, setInquiryToDelete] = useState<Appointment | null>(null);

  // Sync ticketParam if URL changes
  useEffect(() => {
    if (ticketParam) {
      setSearchTerm(ticketParam);
      setDebouncedSearch(ticketParam);
    }
  }, [ticketParam]);

  // Auto-open inquiry detail modal when ticketParam is present
  useEffect(() => {
    if (ticketParam && inquiries.length > 0 && !hasAutoOpened) {
      const match = inquiries.find(
        (i) => i.ticketId.toLowerCase() === ticketParam.toLowerCase() || i.id === ticketParam
      );
      if (match) {
        setSelectedInquiry(match);
        setEditNotes(match.notes || "");
        setSaveNotesSuccess(false);
        setHasAutoOpened(true);
      }
    }
  }, [ticketParam, inquiries, hasAutoOpened]);

  // Row selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch inquiries from API
  const fetchInquiries = async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    else setIsLoading(true);

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
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [activeTab, debouncedSearch]);

  // Selection handlers
  const toggleSelectAll = () => {
    const currentSlice = inquiries.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
    const sliceIds = currentSlice.map((i) => i.id);
    const allSelected = sliceIds.every((id) => selectedIds.includes(id));

    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !sliceIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...sliceIds])));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Open details modal
  const handleOpenDetail = (inquiry: Appointment) => {
    setSelectedInquiry(inquiry);
    setEditNotes(inquiry.notes || "");
    setSaveNotesSuccess(false);
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
        fetchInquiries();
      }
    } catch (err) {
      console.error("Status update error:", err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Save Staff Internal Notes
  const handleSaveNotes = async () => {
    if (!selectedInquiry) return;
    setIsSavingNotes(true);
    setSaveNotesSuccess(false);
    try {
      const res = await fetch(`/api/admin/inquiries/${selectedInquiry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: editNotes }),
      });
      if (res.ok) {
        const data = await res.json();
        setInquiries((prev) =>
          prev.map((item) =>
            item.id === selectedInquiry.id ? { ...item, notes: data.inquiry.notes } : item
          )
        );
        setSelectedInquiry((prev) => (prev ? { ...prev, notes: data.inquiry.notes } : null));
        setSaveNotesSuccess(true);
        setTimeout(() => setSaveNotesSuccess(false), 2500);
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
        setSelectedIds((prev) => prev.filter((item) => item !== id));
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
      "Primary Goal / Service",
      "Preferred Date",
      "Preferred Time (EST)",
      "Status",
      "Parent Message",
      "Internal Staff Notes",
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
      `"${(i.message || "").replace(/"/g, '""')}"`,
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
      `radiant_form_submissions_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "NEW":
        return "border border-blue-400 bg-blue-50 text-blue-600";
      case "CONTACTED":
        return "border border-amber-400 bg-amber-50 text-amber-700";
      case "CONFIRMED":
        return "border border-emerald-400 bg-emerald-50 text-emerald-700";
      case "COMPLETED":
        return "border border-slate-300 bg-slate-100 text-slate-700";
      case "CANCELLED":
        return "border border-rose-300 bg-rose-50 text-rose-700";
      default:
        return "border border-slate-300 bg-slate-50 text-slate-600";
    }
  };

  const formatSubmittedAt = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const datePart = d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      const timePart = d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
      return `${datePart}, ${timePart}`;
    } catch {
      return dateStr;
    }
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, activeTab]);

  // Pagination Math
  const totalPages = Math.max(1, Math.ceil(inquiries.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, inquiries.length);
  const paginatedInquiries = inquiries.slice(startIndex, endIndex);

  return (
    <div className="flex flex-col h-full min-h-0 space-y-4 max-w-7xl mx-auto w-full">
      {/* Top Header (Radiant Theme) */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Assessments & Inquiries
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Manage all form submissions from website
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={inquiries.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export</span>
          </button>

          <button
            type="button"
            onClick={() => fetchInquiries(true)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs shadow-blue-600/20 transition-all disabled:opacity-60 cursor-pointer"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs (Radiant Blue Theme) */}
      <div className="shrink-0 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: "ALL", label: "All", count: counts.all },
          { id: "NEW", label: `New ${counts.new}`, highlight: true },
          { id: "CONFIRMED", label: "Reviewing", count: counts.confirmed },
          { id: "CONTACTED", label: "Contacted", count: counts.contacted },
          { id: "COMPLETED", label: "Accepted", count: counts.completed },
          { id: "CANCELLED", label: "Rejected", count: counts.cancelled },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                isActive
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search & Secondary Filter Bar */}
      <div className="shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, phone..."
            className="w-full pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => {
              if (activeTab !== "ALL") setActiveTab("ALL");
              else setActiveTab("NEW");
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <span>Filters</span>
          </button>

          <button
            type="button"
            onClick={() => handleExportCSV()}
            title="Export CSV"
            className="p-2.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>

      {/* Main Table Card Box */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col min-h-0 flex-1 overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">
              Loading Submissions...
            </p>
          </div>
        ) : inquiries.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-slate-800 text-sm font-bold">No Submissions Found</h3>
            <p className="text-slate-500 text-xs max-w-sm mx-auto font-medium">
              {debouncedSearch
                ? `No submissions match "${debouncedSearch}".`
                : "No form submissions found in this tab category."}
            </p>
          </div>
        ) : (
          <>
            {/* Scrollable Container (Sticky Header + Hidden Scrollbar) */}
            <div className="overflow-y-auto overflow-x-auto flex-1 min-h-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <table className="w-full text-left text-xs border-collapse min-w-[950px]">
                <thead className="sticky top-0 z-10 shadow-2xs bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[11px] font-extrabold">
                  <tr>
                    <th className="py-3.5 pl-6 pr-2 w-10 bg-slate-50">
                      <input
                        type="checkbox"
                        checked={
                          paginatedInquiries.length > 0 &&
                          paginatedInquiries.every((i) => selectedIds.includes(i.id))
                        }
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </th>
                    <th className="py-3.5 px-4 w-12 text-center text-slate-400 bg-slate-50">#</th>
                    <th className="py-3.5 px-6 bg-slate-50">Name</th>
                    <th className="py-3.5 px-6 bg-slate-50">Email</th>
                    <th className="py-3.5 px-6 bg-slate-50">Phone</th>
                    <th className="py-3.5 px-6 bg-slate-50">Primary Goal</th>
                    <th className="py-3.5 px-6 bg-slate-50">Status</th>
                    <th className="py-3.5 px-6 bg-slate-50">Submitted At</th>
                    <th className="py-3.5 px-6 text-right bg-slate-50">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium text-xs">
                  {paginatedInquiries.map((appt, idx) => {
                    const rowNum = startIndex + idx + 1;
                    const isSelected = selectedIds.includes(appt.id);

                    return (
                      <tr
                        key={appt.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isSelected ? "bg-blue-50/40" : ""
                        }`}
                      >
                        <td className="py-4 pl-6 pr-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectOne(appt.id)}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </td>
                        <td className="py-4 px-4 text-center font-bold text-slate-400">
                          {rowNum}
                        </td>
                        <td className="py-4 px-6 font-bold text-slate-900">
                          {appt.fullName}
                        </td>
                        <td className="py-4 px-6 text-slate-600 font-normal">
                          {appt.email}
                        </td>
                        <td className="py-4 px-6 text-slate-600 font-normal">
                          {appt.phone || "—"}
                        </td>
                        <td className="py-4 px-6 text-slate-700 font-semibold max-w-[200px] truncate">
                          {appt.service}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${getStatusBadge(
                              appt.status
                            )}`}
                          >
                            {appt.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-slate-500 text-[11px] whitespace-nowrap">
                          {formatSubmittedAt(appt.createdAt)}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenDetail(appt)}
                              title="View Details"
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/50 transition-colors cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setInquiryToDelete(appt);
                                setIsDeleteOpen(true);
                              }}
                              title="Delete"
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50/50 transition-colors cursor-pointer"
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

            {/* Pinned Smart Pagination */}
            <AdminPagination
              currentPage={currentPage}
              totalItems={inquiries.length}
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

      {/* DETAIL MODAL (ALL DETAILS IN ONE CLEAN PLACE - NO TABS) */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200/80 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 sm:px-8 pt-6 pb-4 flex items-center justify-between border-b border-slate-100 shrink-0 bg-white">
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Submission Details
              </h2>
              <button
                type="button"
                onClick={() => setSelectedInquiry(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body - All Details in ONE place */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
              {/* Top Profile Card */}
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-4">
                  {/* Large Circle Avatar */}
                  <div className="w-14 h-14 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                    <User className="w-7 h-7" />
                  </div>

                  {/* Name, Status, Contacts */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-slate-900">
                        {selectedInquiry.fullName}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${getStatusBadge(
                          selectedInquiry.status
                        )}`}
                      >
                        {selectedInquiry.status}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 text-xs text-slate-600 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{selectedInquiry.email}</span>
                      </span>

                      {selectedInquiry.phone && (
                        <span className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{selectedInquiry.phone}</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-0.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Submitted: {formatSubmittedAt(selectedInquiry.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Status Select on Right */}
                <div className="shrink-0 self-start sm:self-auto space-y-1">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Status
                  </span>
                  <select
                    value={selectedInquiry.status}
                    onChange={(e) => handleStatusChange(selectedInquiry.id, e.target.value)}
                    disabled={isUpdatingStatus}
                    className="px-3.5 py-1.5 bg-white border border-slate-300 hover:border-blue-400 rounded-xl text-xs font-bold text-slate-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                  >
                    <option value="NEW">New</option>
                    <option value="CONFIRMED">Reviewing</option>
                    <option value="CONTACTED">Contacted</option>
                    <option value="COMPLETED">Accepted</option>
                    <option value="CANCELLED">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Structured Submission Info Card (2-Column Grid) */}
              <div className="rounded-2xl border border-slate-200/80 p-5 bg-white space-y-4">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                  Form Submission Information
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3.5 gap-x-6 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-bold text-slate-400">Parent / Guardian Name</span>
                    <p className="font-extrabold text-slate-900 text-sm">
                      {selectedInquiry.fullName}
                    </p>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[11px] font-bold text-slate-400">Primary Goal / Service</span>
                    <p className="font-extrabold text-blue-600 text-sm">
                      {selectedInquiry.service}
                    </p>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[11px] font-bold text-slate-400">Email Address</span>
                    <p className="font-medium text-slate-700">
                      {selectedInquiry.email}
                    </p>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[11px] font-bold text-slate-400">Phone Number</span>
                    <p className="font-medium text-slate-700">
                      {selectedInquiry.phone || "Not Provided"}
                    </p>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[11px] font-bold text-slate-400">Preferred Appointment Date</span>
                    <p className="font-medium text-slate-700">
                      {selectedInquiry.preferredDate || "Flexible"}
                    </p>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[11px] font-bold text-slate-400">Preferred Time</span>
                    <p className="font-medium text-slate-700">
                      {selectedInquiry.preferredTime ? `${selectedInquiry.preferredTime} EST` : "Flexible"}
                    </p>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[11px] font-bold text-slate-400">Ticket Reference</span>
                    <p className="font-mono font-bold text-blue-600">
                      #{selectedInquiry.ticketId}
                    </p>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[11px] font-bold text-slate-400">Intake Status</span>
                    <p className="font-extrabold text-slate-800 uppercase">
                      {selectedInquiry.status}
                    </p>
                  </div>
                </div>
              </div>

              {/* Parent Message Card */}
              <div className="rounded-2xl border border-slate-200/80 p-5 bg-white space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>Parent Message / Inquiry</span>
                  </h4>

                  {/* Quick Direct Actions */}
                  <div className="flex items-center gap-2">
                    <a
                      href={`mailto:${selectedInquiry.email}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Mail className="w-3 h-3" />
                      <span>Email</span>
                    </a>

                    {selectedInquiry.phone && (
                      <a
                        href={`tel:${selectedInquiry.phone}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Call</span>
                      </a>
                    )}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 text-slate-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                  {selectedInquiry.message || "No additional message was written by the parent."}
                </div>
              </div>

              {/* Staff Internal Note Section */}
              <div className="rounded-2xl border border-slate-200/80 p-5 bg-white space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-blue-600" />
                      <span>Admin / Staff Internal Note</span>
                    </h4>
                    <p className="text-[10px] text-slate-400 font-medium">
                      Private note for clinic staff only (not visible to parents)
                    </p>
                  </div>

                  {saveNotesSuccess && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      <Check className="w-3.5 h-3.5" />
                      Saved!
                    </span>
                  )}
                </div>

                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Add private staff notes (e.g. called parent, child age 4, trial session booked)..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all leading-relaxed"
                />

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveNotes}
                    disabled={isSavingNotes}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {isSavingNotes ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    <span>{isSavingNotes ? "Saving..." : "Save Note"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminInquiriesPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Loading Inquiries...</p>
        </div>
      }
    >
      <AdminInquiriesContent />
    </Suspense>
  );
}
