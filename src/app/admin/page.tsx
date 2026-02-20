"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CalendarCheck,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  TrendingUp,
  ChevronRight,
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
  price: number;
  field: { name: string };
}

interface Stats {
  todayBookings: number;
  pendingCount: number;
  confirmedToday: number;
}

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<Stats>({
    todayBookings: 0,
    pendingCount: 0,
    confirmedToday: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const today = new Date().toISOString().split("T")[0];

      const res = await fetch(`/api/admin/bookings?date=${today}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
        setStats(data.stats || { todayBookings: 0, pendingCount: 0, confirmedToday: 0 });
      }
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Status change error:", error);
    }
  };

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("uz-UZ").format(p) + " so'm";

  const statusColor: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    confirmed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
    blocked: "bg-gray-100 text-gray-700",
  };

  const statusLabel: Record<string, string> = {
    pending: "Kutilmoqda",
    confirmed: "Tasdiqlandi",
    cancelled: "Bekor",
    blocked: "Bloklangan",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Bugungi holat</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mb-2">
            <CalendarCheck className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.todayBookings}</p>
          <p className="text-xs text-gray-500">Bugungi bronlar</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center mb-2">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-600">{stats.pendingCount}</p>
          <p className="text-xs text-gray-500">Kutilmoqda</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.confirmedToday}</p>
          <p className="text-xs text-gray-500">Tasdiqlangan</p>
        </div>
      </div>

      {/* Pending Bookings */}
      {bookings.filter((b) => b.status === "pending").length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <h2 className="font-bold text-amber-800">
              Tasdiqlash kutilmoqda ({bookings.filter((b) => b.status === "pending").length})
            </h2>
          </div>
          <div className="space-y-2">
            {bookings
              .filter((b) => b.status === "pending")
              .map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white rounded-xl p-3 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-sm text-gray-900">
                      {booking.customerName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {booking.field.name} • {booking.startTime}–{booking.endTime} •{" "}
                      {formatPrice(booking.price)}
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleStatusChange(booking.id, "confirmed")}
                      className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center hover:bg-green-200 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </button>
                    <button
                      onClick={() => handleStatusChange(booking.id, "cancelled")}
                      className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center hover:bg-red-200 transition-colors"
                    >
                      <XCircle className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Today's Bookings */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-900">Bugungi bronlar</h2>
          <Link
            href="/admin/bookings"
            className="text-sm text-green-600 font-medium flex items-center gap-1"
          >
            Barchasi <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
            <CalendarCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400">Bugun hali bron yo'q</p>
          </div>
        ) : (
          <div className="space-y-2">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-green-700">
                    {booking.field.name.replace("Maydon ", "")}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">
                    {booking.customerName || "—"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {booking.startTime}–{booking.endTime} • {formatPrice(booking.price)}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-semibold px-2 py-1 rounded-lg ${statusColor[booking.status]}`}
                >
                  {statusLabel[booking.status]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
