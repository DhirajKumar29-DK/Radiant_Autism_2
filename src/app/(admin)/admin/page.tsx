"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  Brain,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Plus,
  Loader2,
  Phone,
  Mail,
  Star,
} from "lucide-react";

interface Appointment {
  id: string;
  ticketId: string;
  fullName: string;
  email: string;
  phone?: string;
  service: string;
  preferredDate: string;
  preferredTime?: string;
  status: "NEW" | "CONTACTED" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  createdAt: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalAppointments: 0,
    newAppointments: 0,
    totalServices: 4,
    totalTeam: 4,
  });
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch("/api/admin/dashboard");
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
          setRecentAppointments((data.recentAppointments || []).slice(0, 5));
        }
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

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
      default:
        return "bg-rose-100 text-rose-800 border-rose-200";
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-extrabold uppercase tracking-wider border border-blue-400/20">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Clinical Operations Live</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome to Radiant Care Control
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm font-medium max-w-xl">
            Monitor client consultations, appointments, and manage clinical programs, team, and content in real time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/inquiries"
            className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            <span>Inquiries Desk</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Counter Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Appointments */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Total Inquiries
            </span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono">
            {stats.totalAppointments}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">All parent consultations recorded</p>
        </div>

        {/* New / Pending Action */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Pending Follow-ups
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-600 font-mono">
            {stats.newAppointments}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">Inquiries awaiting clinic call</p>
        </div>

        {/* Active Core Programs */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Active Programs
            </span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Brain className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono">
            {stats.totalServices}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">ABA, Speech, OT & Life Skills</p>
        </div>

        {/* Clinical Team Staff */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Clinical Team
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono">
            {stats.totalTeam}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">RBA & Clinical staff members</p>
        </div>
      </div>

      {/* Recent Appointments & Consultation Requests */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-6 sm:px-8 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Recent Consultation Requests
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-extrabold text-[10px] border border-blue-200 tracking-wide uppercase">
                Latest 5
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Parents who booked through the website booking form (showing up to 5 most recently updated)
            </p>
          </div>
          <Link
            href="/admin/inquiries"
            className="text-xs font-extrabold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition-colors uppercase tracking-wider"
          >
            <span>View All Inquiries ({stats.totalAppointments})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {recentAppointments.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <p className="text-slate-800 text-sm font-bold">No Inquiries Recorded Yet</p>
            <p className="text-slate-500 text-xs max-w-sm mx-auto font-medium">
              When a parent submits a consultation request from the website form, it will appear here immediately.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider text-[10px] font-black border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">Ticket</th>
                  <th className="py-3.5 px-6">Parent Name</th>
                  <th className="py-3.5 px-6">Contact Info</th>
                  <th className="py-3.5 px-6">Program</th>
                  <th className="py-3.5 px-6">Appointment Date</th>
                  <th className="py-3.5 px-6">Prefer Time (EST)</th>
                  <th className="py-3.5 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {recentAppointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-blue-700">
                      #{appt.ticketId}
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900">
                      {appt.fullName}
                    </td>
                    <td className="py-4 px-6 space-y-0.5">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{appt.email}</span>
                      </div>
                      {appt.phone && (
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{appt.phone}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-800">
                      {appt.service}
                    </td>
                    <td className="py-4 px-6">
                      {appt.preferredDate}
                    </td>
                    <td className="py-4 px-6">
                      {appt.preferredTime ? `${appt.preferredTime} EST` : "Flexible"}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusBadge(appt.status)}`}>
                        {appt.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {recentAppointments.length > 0 && (
          <div className="p-4 sm:px-8 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
            <span className="font-semibold text-[11px] text-slate-500">
              Showing {recentAppointments.length} of {stats.totalAppointments} inquiries
            </span>
            <Link
              href="/admin/inquiries"
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
            >
              <span>Manage all inquiries in Inquiries Desk</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* Quick Access Action Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Link
          href="/admin/services"
          className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all group flex items-start gap-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Brain className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
              Manage Services
            </h4>
            <p className="text-xs text-slate-500 font-medium">
              Add new programs, update descriptions, badges, and pricing.
            </p>
          </div>
        </Link>

        <Link
          href="/admin/hero"
          className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all group flex items-start gap-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Star className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-amber-600 transition-colors">
              Page Heroes
            </h4>
            <p className="text-xs text-slate-500 font-medium">
              Edit Home slider, About, Services, and Contact banner photos and text.
            </p>
          </div>
        </Link>

        <Link
          href="/admin/navigation"
          className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all group flex items-start gap-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Users className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-purple-600 transition-colors">
              UI Visibility
            </h4>
            <p className="text-xs text-slate-500 font-medium">
              Toggle which Navbar items and sections are shown on the website.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
