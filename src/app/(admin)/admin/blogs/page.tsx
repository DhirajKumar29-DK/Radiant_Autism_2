"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  Plus,
  Edit,
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
} from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  authorName: string;
  category: string;
  coverImage?: string | null;
  status: string;
  publishedAt?: string | null;
  createdAt: string;
}

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalMode, setModalMode] = useState<"ADD" | "EDIT" | null>(null);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    author: "Jesenia Duran, RBA",
    category: "ABA Therapy",
    image: "/hero_child_therapy.jpg",
    isPublished: true,
  });

  const fetchBlogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/blogs");
      if (res.ok) {
        const data = await res.json();
        setBlogs(data.blogs || []);
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
      category: "ABA Therapy",
      image: "/hero_child_therapy.jpg",
      isPublished: true,
    });
    setEditingBlog(null);
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
      category: blog.category,
      image: blog.coverImage || "/hero_child_therapy.jpg",
      isPublished: blog.status === "PUBLISHED",
    });
    setModalMode("EDIT");
  };

  const handleTogglePublished = async (blog: BlogPost) => {
    try {
      const nextStatus = blog.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
      const res = await fetch(`/api/admin/blogs/${blog.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: nextStatus === "PUBLISHED" }),
      });
      if (res.ok) {
        setBlogs((prev) =>
          prev.map((item) => (item.id === blog.id ? { ...item, status: nextStatus } : item))
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
        const res = await fetch("/api/admin/blogs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          fetchBlogs();
          setModalMode(null);
        } else {
          const errData = await res.json();
          alert(errData.error || "Failed to create article");
        }
      } else if (modalMode === "EDIT" && editingBlog) {
        const res = await fetch(`/api/admin/blogs/${editingBlog.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          fetchBlogs();
          setModalMode(null);
        } else {
          const errData = await res.json();
          alert(errData.error || "Failed to update article");
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
      const res = await fetch(`/api/admin/blogs/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setBlogs((prev) => prev.filter((item) => item.id !== id));
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
              Clinical Articles & Parent Guides
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-extrabold text-xs">
              {blogs.length} Articles
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Write evidence-based articles on autism therapy, speech milestones, sensory tips, and Ontario Autism Program (OAP) funding guides.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold rounded-2xl shadow-lg shadow-blue-600/30 transition-all uppercase tracking-wider"
        >
          <Plus className="w-4 h-4" />
          <span>Write Clinical Article</span>
        </button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">
            Loading Articles...
          </p>
        </div>
      ) : blogs.length === 0 ? (
        <div className="bg-white p-16 rounded-3xl border border-slate-200 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <BookOpen className="w-7 h-7" />
          </div>
          <h3 className="text-slate-900 font-bold text-base">No Articles Published Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
            Publish your first pediatric therapy guide or parent resource.
          </p>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
          >
            Create First Article
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => {
            const isPublished = blog.status === "PUBLISHED";
            return (
              <div
                key={blog.id}
                className={`bg-white rounded-3xl border transition-all overflow-hidden flex flex-col justify-between ${
                  isPublished
                    ? "border-slate-200/90 shadow-xs hover:shadow-md hover:border-blue-400"
                    : "border-slate-200 opacity-60 bg-slate-50/50"
                }`}
              >
                {/* Image Frame */}
                <div className="relative aspect-16/10 w-full bg-slate-100 overflow-hidden group">
                  <Image
                    src={blog.coverImage || "/hero_child_therapy.jpg"}
                    alt={blog.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 rounded-full bg-blue-600/90 text-white text-[10px] font-black uppercase tracking-wider shadow-sm backdrop-blur-xs">
                      {blog.category}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <button
                      onClick={() => handleTogglePublished(blog)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm backdrop-blur-md ${
                        isPublished
                          ? "bg-emerald-500/90 text-white"
                          : "bg-amber-500/90 text-white"
                      }`}
                    >
                      {isPublished ? (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          <span>Published</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" />
                          <span>Draft</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="text-[10px] font-mono uppercase text-blue-200 font-bold">
                      /{blog.slug}
                    </span>
                    <h3 className="font-black text-base line-clamp-1">{blog.title}</h3>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between text-xs">
                  <div className="space-y-2">
                    <p className="text-slate-600 font-medium line-clamp-2 leading-relaxed">
                      {blog.excerpt || blog.content.slice(0, 100) + "..."}
                    </p>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 font-bold">
                        <User className="w-3 h-3 text-slate-400" />
                        {blog.authorName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {new Date(blog.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <Link
                      href={`/blogs/${blog.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-wider"
                    >
                      <span>Read Article</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(blog)}
                        className="p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Edit Article"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(blog.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Article"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
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
              <h3 className="font-extrabold text-slate-900 text-base">Delete Clinical Article?</h3>
              <p className="text-xs text-slate-500 font-medium">
                This article will be permanently removed from the website and database.
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
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600">
                  {modalMode === "ADD" ? "New Publication" : "Edit Publication"}
                </span>
                <h2 className="text-xl font-black text-slate-900 tracking-tight mt-1">
                  {modalMode === "ADD" ? "Write Clinical Article" : `Edit: ${formData.title}`}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                    Article Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        title: newTitle,
                        slug:
                          modalMode === "ADD"
                            ? newTitle
                                .toLowerCase()
                                .replace(/[^a-z0-9]+/g, "-")
                                .replace(/^-|-$/g, "")
                            : prev.slug,
                      }));
                    }}
                    placeholder="e.g. Navigating Ontario Autism Program (OAP) Funding"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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
                    placeholder="e.g. navigating-oap-funding"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-slate-800"
                  >
                    <option value="ABA Therapy">ABA Therapy</option>
                    <option value="Speech & Language">Speech & Language</option>
                    <option value="Sensory & Motor">Sensory & Motor</option>
                    <option value="Parent Guides">Parent Guides</option>
                    <option value="OAP Funding">OAP Funding</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                    Author Name / Clinician
                  </label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData((prev) => ({ ...prev, author: e.target.value }))}
                    placeholder="e.g. Jesenia Duran, RBA"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-slate-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                    Featured Image Path
                  </label>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData((prev) => ({ ...prev, image: e.target.value }))}
                    placeholder="e.g. /hero_child_therapy.jpg"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                  Article Excerpt / Summary
                </label>
                <textarea
                  rows={2}
                  value={formData.excerpt}
                  onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Short introductory summary displayed on catalog cards..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-slate-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                  Full Article Content (Markdown or formatted paragraphs) *
                </label>
                <textarea
                  rows={8}
                  required
                  value={formData.content}
                  onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                  placeholder="Write the full clinical article content here..."
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="publishedToggle"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData((prev) => ({ ...prev, isPublished: e.target.checked }))}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <label htmlFor="publishedToggle" className="font-bold text-slate-800 cursor-pointer">
                  Publish article live on website
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
                  <span>{modalMode === "ADD" ? "Publish Article" : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
