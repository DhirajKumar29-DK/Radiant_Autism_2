"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  Plus,
  Edit3,
  Trash2,
  ExternalLink,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  X,
  Save,
  Calendar,
  User,
  Tag,
  Search,
  FileText,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  Globe,
  Share2,
} from "lucide-react";
import AdminPagination from "@/components/common/AdminPagination";
import ConfirmModal from "@/components/common/ConfirmModal";
import RichTextEditor from "@/components/admin/RichTextEditor";
import ImageUploadField from "@/components/admin/ImageUploadField";

type BlogStatusType = "PUBLISHED" | "DRAFT";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  authorName: string;
  authorRole?: string | null;
  category: string;
  coverImage?: string | null;
  status: BlogStatusType;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  ogImage?: string | null;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

const CATEGORIES = [
  "ALL",
  "ABA Therapy",
  "OAP Funding",
  "Speech & Language",
  "Occupational Therapy",
  "Parent Guides",
];

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalMode, setModalMode] = useState<"ADD" | "EDIT" | null>(null);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Search & Category Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // Selection & Bulk Action
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [deleteTargetIds, setDeleteTargetIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  // Advanced SEO Collapsible
  const [isSeoOpen, setIsSeoOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    author: "Jesenia Duran, RBA",
    authorRole: "Registered Clinical Supervisor",
    category: "ABA Therapy",
    image: "/hero_child_therapy.jpg",
    status: "PUBLISHED" as BlogStatusType,
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    ogImage: "",
  });

  const fetchBlogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/blogs");
      if (res.ok) {
        const data = await res.json();
        const mapped: BlogPost[] = (data.blogs || []).map((b: any) => ({
          ...b,
          status: (b.status as BlogStatusType) || "DRAFT",
        }));
        setBlogs(mapped);
      }
    } catch (err) {
      console.error("Failed to load blogs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const openAddModal = () => {
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      author: "Jesenia Duran, RBA",
      authorRole: "Registered Clinical Supervisor",
      category: "ABA Therapy",
      image: "/hero_child_therapy.jpg",
      status: "PUBLISHED",
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
      ogImage: "",
    });
    setEditingBlog(null);
    setSaveSuccess(false);
    setIsSeoOpen(false);
    setModalMode("ADD");
  };

  const openEditModal = (blog: BlogPost) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt || "",
      content: blog.content,
      author: blog.authorName,
      authorRole: blog.authorRole || "Registered Clinical Supervisor",
      category: blog.category,
      image: blog.coverImage || "/hero_child_therapy.jpg",
      status: blog.status,
      metaTitle: blog.metaTitle || "",
      metaDescription: blog.metaDescription || "",
      metaKeywords: blog.metaKeywords || "",
      ogImage: blog.ogImage || "",
    });
    setSaveSuccess(false);
    // If blog has meta data, keep SEO panel open for convenience
    setIsSeoOpen(Boolean(blog.metaTitle || blog.metaDescription || blog.metaKeywords || blog.ogImage));
    setModalMode("EDIT");
  };

  // Filter & Search
  const filteredBlogs = useMemo(() => {
    return blogs.filter((b) => {
      const matchCat = selectedCategory === "ALL" || b.category === selectedCategory;
      const matchSearch =
        !searchQuery.trim() ||
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.authorName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [blogs, selectedCategory, searchQuery]);

  // Reset page to 1 when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredBlogs.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBlogs = useMemo(() => {
    return filteredBlogs.slice(startIndex, endIndex);
  }, [filteredBlogs, startIndex, endIndex]);

  // Selection handlers
  const toggleSelectAll = () => {
    if (paginatedBlogs.length > 0 && paginatedBlogs.every((b) => selectedIds.includes(b.id))) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedBlogs.map((b) => b.id));
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
  const cycleStatus = async (blog: BlogPost) => {
    const nextStatus: BlogStatusType = blog.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";

    try {
      const res = await fetch(`/api/admin/blogs/${blog.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setBlogs((prev) =>
          prev.map((b) => (b.id === blog.id ? { ...b, status: nextStatus } : b))
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
        const res = await fetch(`/api/admin/blogs/${id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          setBlogs((prev) => prev.filter((item) => item.id !== id));
          setSelectedIds((prev) => prev.filter((item) => item !== id));
        }
      } else {
        const res = await fetch("/api/admin/blogs", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: deleteTargetIds }),
        });
        if (res.ok) {
          setBlogs((prev) => prev.filter((item) => !deleteTargetIds.includes(item.id)));
          setSelectedIds([]);
        }
      }
      setIsConfirmDeleteOpen(false);
      setDeleteTargetIds([]);
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting article(s)");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSaveSuccess(false);

    try {
      const payload = {
        title: formData.title,
        slug: formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]/g, "-"),
        excerpt: formData.excerpt,
        content: formData.content,
        authorName: formData.author,
        authorRole: formData.authorRole,
        category: formData.category,
        image: formData.image,
        status: formData.status,
        metaTitle: formData.metaTitle || null,
        metaDescription: formData.metaDescription || null,
        metaKeywords: formData.metaKeywords || null,
        ogImage: formData.ogImage || null,
      };

      if (modalMode === "ADD") {
        const res = await fetch("/api/admin/blogs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          setSaveSuccess(true);
          await fetchBlogs();
          setTimeout(() => {
            setModalMode(null);
            setSaveSuccess(false);
          }, 1000);
        } else {
          const errData = await res.json();
          alert(errData.error || "Failed to create article");
        }
      } else if (modalMode === "EDIT" && editingBlog) {
        const res = await fetch(`/api/admin/blogs/${editingBlog.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          setSaveSuccess(true);
          await fetchBlogs();
          setTimeout(() => {
            setModalMode(null);
            setSaveSuccess(false);
          }, 1000);
        } else {
          const errData = await res.json();
          alert(errData.error || "Failed to update article");
        }
      }
    } catch (err) {
      console.error("Submit error:", err);
      alert("Network or server error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "Draft";
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

  const renderStatusBadge = (st: BlogStatusType, blog: BlogPost) => {
    if (st === "PUBLISHED") {
      return (
        <button
          type="button"
          onClick={() => cycleStatus(blog)}
          title="Click to toggle status (PUBLISHED <-> DRAFT)"
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          PUBLISHED
        </button>
      );
    }
    return (
      <button
        type="button"
        onClick={() => cycleStatus(blog)}
        title="Click to toggle status (DRAFT <-> PUBLISHED)"
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        DRAFT
      </button>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Clinical Articles & Blog
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-extrabold text-xs">
              {blogs.length} Articles
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Create, edit, and publish SEO-optimized clinical articles, therapy guides, and parent resources.
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
            <span>Create Article</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {CATEGORIES.map((cat) => (
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
            placeholder="Search article or author..."
            className="bg-transparent text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none w-full"
          />
        </div>
      </div>

      {/* Main Table View (FabFit Style) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">
              Loading Articles...
            </p>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="bg-white p-16 rounded-3xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <BookOpen className="w-7 h-7" />
            </div>
            <h3 className="text-slate-900 font-bold text-base">No Articles Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
              Publish your first clinical therapy article or parent education guide.
            </p>
            <button
              type="button"
              onClick={openAddModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
            >
              Write First Article
            </button>
          </div>
        ) : (
          <>
            {/* Scrollable Container (Rows scroll cleanly, browser scrollbar hidden) */}
            <div className="overflow-y-auto flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <table className="w-full text-left border-collapse min-w-[800px]">
                {/* 1. STICKY THEAD: Scroll karne par headers upar chipke rahenge */}
                <thead className="sticky top-0 z-10 shadow-xs bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-4 pl-6 pr-2 w-10">
                      <input
                        type="checkbox"
                        checked={
                          paginatedBlogs.length > 0 &&
                          paginatedBlogs.every((b) => selectedIds.includes(b.id))
                        }
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </th>
                    <th className="py-4 px-3 w-12 text-center">#</th>
                    <th className="py-4 px-6">Article</th>
                    <th className="py-4 px-6">Category</th>
                    <th className="py-4 px-6">Author</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">Published</th>
                    <th className="py-4 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {paginatedBlogs.map((blog, idx) => {
                    const rowNumber = (currentPage - 1) * itemsPerPage + idx + 1;
                    const isSelected = selectedIds.includes(blog.id);

                    return (
                      <tr
                        key={blog.id}
                        className={`hover:bg-slate-50/50 transition-colors ${
                          isSelected ? "bg-blue-50/30" : ""
                        }`}
                      >
                        <td className="py-4 pl-6 pr-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectOne(blog.id)}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </td>

                        <td className="py-4 px-3 font-bold text-slate-400 text-center">
                          {rowNumber}
                        </td>

                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative shrink-0">
                              <Image
                                src={blog.coverImage || "/hero_child_therapy.jpg"}
                                alt={blog.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-extrabold text-slate-900 line-clamp-1">{blog.title}</p>
                              <p className="text-[11px] text-blue-600 font-mono font-medium">
                                /{blog.slug}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <span className="inline-block px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-[11px] font-extrabold border border-blue-100">
                            {blog.category}
                          </span>
                        </td>

                        <td className="py-4 px-6 font-semibold text-slate-700">
                          {blog.authorName}
                        </td>

                        {/* Status Badge with Click-to-Cycle */}
                        <td className="py-4 px-6">
                          {renderStatusBadge(blog.status, blog)}
                        </td>

                        <td className="py-4 px-6 font-semibold text-slate-500">
                          {formatDate(blog.publishedAt || blog.createdAt)}
                        </td>

                        {/* Dual Action: Edit + Delete */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEditModal(blog)}
                              title="Edit Article"
                              className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200/80 transition-all inline-flex items-center gap-1.5 font-bold cursor-pointer"
                            >
                              <Edit3 className="w-4 h-4" />
                              <span className="text-[11px]">Edit</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => confirmSingleDelete(blog.id)}
                              title="Delete"
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

            {/* 3. STICKY PAGINATION: Table ke theek niche pinned */}
            <AdminPagination
              currentPage={currentPage}
              totalItems={filteredBlogs.length}
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

      {/* POPUP MODAL (Add / Edit) */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-hidden flex flex-col border border-slate-100">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  {modalMode === "ADD" ? "Create New Article" : "Edit Article"}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Update title, slug, category, author info, cover image, and article content.
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
              {/* Title & Slug */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                    Article Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => {
                      const t = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        title: t,
                        slug: prev.slug || t.toLowerCase().replace(/[^a-z0-9]/g, "-"),
                      }));
                    }}
                    placeholder="e.g. Understanding Early Signs of Autism in Toddlers"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                    placeholder="e.g. early-signs-of-autism"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Row 2: Category, Author, Status (3 columns matching Image 2) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                  >
                    {CATEGORIES.filter((c) => c !== "ALL").map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                    Author Name
                  </label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData((prev) => ({ ...prev, author: e.target.value }))}
                    placeholder="e.g. Jesenia Duran, RBA"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, status: e.target.value as BlogStatusType }))
                    }
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                  >
                    <option value="PUBLISHED">PUBLISHED (Live)</option>
                    <option value="DRAFT">DRAFT</option>
                  </select>
                </div>
              </div>

              {/* Cover Image */}
              <ImageUploadField
                label="Featured Cover Image"
                value={formData.image}
                onChange={(url) => setFormData((prev) => ({ ...prev, image: url }))}
                recommendedSize="1200 x 675px"
              />

              {/* Excerpt */}
              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                  Short Description / Excerpt (Quote highlight under featured image & on blog cards)
                </label>
                <textarea
                  rows={2}
                  value={formData.excerpt}
                  onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Brief lead summary / highlight quote of the article (e.g. key takeaway)..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-normal text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Full Content */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                    Article Full Content * (Rich Text Editor)
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">
                    (supports h1, h2, h3, links, lists, bold, highlights)
                  </span>
                </div>
                <RichTextEditor
                  value={formData.content}
                  onChange={(val) => setFormData((prev) => ({ ...prev, content: val }))}
                  placeholder="Write the comprehensive clinical article, case examples, parent tips, and key takeaways here..."
                />
              </div>

              {/* Advanced SEO & Meta Tags Configuration (Matching Image 1) */}
              <div className="border border-slate-200 rounded-2xl bg-slate-50/60 overflow-hidden transition-all">
                <button
                  type="button"
                  onClick={() => setIsSeoOpen(!isSeoOpen)}
                  className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-slate-100/70 transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span className="font-extrabold text-xs text-slate-800 tracking-tight">
                      Advanced SEO & Meta Tags Configuration
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                      isSeoOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isSeoOpen && (
                  <div className="p-5 pt-3 border-t border-slate-200/80 space-y-4 bg-white animate-in fade-in duration-200">
                    {/* Meta Title */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        Meta Title (Google Search Title)
                      </label>
                      <input
                        type="text"
                        value={formData.metaTitle}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, metaTitle: e.target.value }))
                        }
                        placeholder="Custom title tag for search engines"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>

                    {/* Meta Description */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        Meta Description (Search Snippet Text)
                      </label>
                      <textarea
                        rows={2}
                        value={formData.metaDescription}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, metaDescription: e.target.value }))
                        }
                        placeholder="Snippet describing article in Google search results..."
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>

                    {/* Meta Keywords & Social Share Image */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700">
                          Meta Keywords (Comma Separated)
                        </label>
                        <input
                          type="text"
                          value={formData.metaKeywords}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, metaKeywords: e.target.value }))
                          }
                          placeholder="e.g. aba therapy, autism clinic ontario, oap funding"
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700">
                          Social Sharing Image URL (OpenGraph Image)
                        </label>
                        <input
                          type="text"
                          value={formData.ogImage}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, ogImage: e.target.value }))
                          }
                          placeholder="WhatsApp / Facebook Share Image URL"
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
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
                        <span>{modalMode === "ADD" ? "Publish Article" : "Save Changes"}</span>
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
        title="Confirm Deletion"
        message={
          deleteTargetIds.length > 1
            ? `Are you sure you want to delete the selected ${deleteTargetIds.length} articles? Please confirm to proceed.`
            : "Are you sure you want to delete this article? Please confirm to proceed."
        }
        confirmText={
          isDeleting
            ? "Deleting..."
            : "Delete"
        }
        variant="danger"
      />
    </div>
  );
}
