"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Phone,
  User,
  Loader2,
} from "lucide-react";

interface Booking {
  id: string;
  fieldId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  customerName: string;
  customerPhone: string;
  teamName: string;
  note: string;
  blockReason: string;
  price: number;
  createdAt: string;
  field: { name: string };
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [fieldFilter, setFieldFilter] = useState("");

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const params = new URLSearchParams();
      if (dateFilter) params.set("date", dateFilter);
      if (statusFilter) params.set("status", statusFilter);
      if (fieldFilter) params.set("field", fieldFilter);

      const res = await fetch(`/api/admin/bookings?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [dateFilter, statusFilter, fieldFilter]);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const token = localStorage.getItem("admin_token");
      await fetch(`/api/admin/bookings/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      fetchBookings();
    } catch (error) {
      console.error("Status change error:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bronni o'chirmoqchimisiz?")) return;
    try {
      const token = localStorage.getItem("admin_token");
      await fetch(`/api/admin/bookings/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchBookings();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("uz-UZ").format(p) + " so'm";

  const statusColor: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    confirmed: "bg-green-100 text-green-700 border-green-200",
    cancelled: "bg-red-100 text-red-700 border-red-200",
    blocked: "bg-gray-100 text-gray-700 border-gray-200",
  };

  const statusLabel: Record<string, string> = {
    pending: "Kutilmoqda",
    confirmed: "Tasdiqlandi",
    cancelled: "Bekor",
    blocked: "Bloklangan",
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Bronlar ro'yxati</h1>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Filter className="w-4 h-4" />
          <span className="font-medium">Filtrlar</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Barcha holatlar</option>
            <option value="pending">Kutilmoqda</option>
            <option value="confirmed">Tasdiqlandi</option>
            <option value="cancelled">Bekor qilindi</option>
            <option value="blocked">Bloklangan</option>
          </select>
          <select
            value={fieldFilter}
            onChange={(e) => setFieldFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Barcha maydonlar</option>
            <option value="field_1">Maydon 1</option>
            <option value="field_2">Maydon 2</option>
            <option value="field_3">Maydon 3</option>
          </select>
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">Bron topilmadi</p>
        </div>
      ) : (
        <div className="space-y-2">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">
                      {booking.customerName || "—"}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg border ${statusColor[booking.status]}`}
                    >
                      {statusLabel[booking.status]}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span>{booking.field.name}</span>
                    <span>{booking.date}</span>
                    <span>
                      {booking.startTime}–{booking.endTime}
                    </span>
                  </div>
                </div>
                <span className="font-bold text-sm text-gray-700">
                  {formatPrice(booking.price)}
                </span>
              </div>

              {/* Details */}
              <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
                {booking.customerPhone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {booking.customerPhone}
                  </span>
                )}
                {booking.teamName && (
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {booking.teamName}
                  </span>
                )}
                {booking.note && (
                  <span className="text-gray-400 italic">"{booking.note}"</span>
                )}
                {booking.blockReason && (
                  <span className="text-gray-400">Sabab: {booking.blockReason}</span>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {booking.status === "pending" && (
                  <>
                    <button
                      onClick={() => handleStatusChange(booking.id, "confirmed")}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-medium hover:bg-green-200 transition-colors"
                    >
                      <CheckCircle className="w-3 h-3" />
                      Tasdiqlash
                    </button>
                    <button
                      onClick={() => handleStatusChange(booking.id, "cancelled")}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200 transition-colors"
                    >
                      <XCircle className="w-3 h-3" />
                      Rad etish
                    </button>
                  </>
                )}
                {booking.status === "confirmed" && (
                  <button
                    onClick={() => handleStatusChange(booking.id, "cancelled")}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200 transition-colors"
                  >
                    <XCircle className="w-3 h-3" />
                    Bekor qilish
                  </button>
                )}
                <button
                  onClick={() => handleDelete(booking.id)}
                  className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors ml-auto"
                >
                  O'chirish
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
