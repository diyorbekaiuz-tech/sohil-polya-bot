"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Lock, User, Loader2 } from "lucide-react";

interface Booking {
  id: string;
  fieldId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  customerName: string;
  blockReason: string;
}

interface Field {
  id: string;
  name: string;
}

const HOURS = Array.from({ length: 18 }, (_, i) => {
  const h = i + 6;
  return `${String(h).padStart(2, "0")}:00`;
});

export default function AdminCalendarPage() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);

  // Block form
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [blockField, setBlockField] = useState("");
  const [blockStart, setBlockStart] = useState("");
  const [blockEnd, setBlockEnd] = useState("");
  const [blockReason, setBlockReason] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token");

      const [fieldsRes, bookingsRes] = await Promise.all([
        fetch("/api/fields"),
        fetch(`/api/admin/bookings?date=${date}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (fieldsRes.ok) setFields(await fieldsRes.json());
      if (bookingsRes.ok) {
        const data = await bookingsRes.json();
        setBookings(
          (data.bookings || []).filter((b: Booking) => b.date === date)
        );
      }
    } catch (error) {
      console.error("Calendar error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [date]);

  const changeDate = (days: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    setDate(d.toISOString().split("T")[0]);
  };

  const getBookingForSlot = (fieldId: string, hour: string) => {
    const hourNum = parseInt(hour.split(":")[0]);
    return bookings.find((b) => {
      if (b.fieldId !== fieldId) return false;
      const startH = parseInt(b.startTime.split(":")[0]);
      const endH = parseInt(b.endTime.split(":")[0]);
      return hourNum >= startH && hourNum < endH;
    });
  };

  const getSlotColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-red-400 text-white";
      case "pending":
        return "bg-amber-400 text-white";
      case "blocked":
        return "bg-gray-400 text-white";
      case "cancelled":
        return "bg-gray-200 text-gray-500";
      default:
        return "bg-green-50 hover:bg-green-100";
    }
  };

  const handleBlock = async () => {
    if (!blockField || !blockStart || !blockEnd) return;
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch("/api/admin/blocked", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fieldId: blockField,
          date,
          startTime: blockStart,
          endTime: blockEnd,
          reason: blockReason || "Yopiq",
        }),
      });

      if (res.ok) {
        setShowBlockForm(false);
        setBlockField("");
        setBlockStart("");
        setBlockEnd("");
        setBlockReason("");
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || "Xatolik yuz berdi");
      }
    } catch {
      alert("Tarmoq xatoligi");
    }
  };

  const dayNames = ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];
  const dateObj = new Date(date + "T00:00:00");
  const dayName = dayNames[dateObj.getDay()];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Kalendar</h1>
        <button
          onClick={() => setShowBlockForm(!showBlockForm)}
          className="flex items-center gap-1 px-3 py-2 bg-gray-700 text-white rounded-xl text-xs font-medium press-effect"
        >
          <Lock className="w-3 h-3" />
          Vaqt bloklash
        </button>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center justify-between bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
        <button onClick={() => changeDate(-1)} className="p-2 rounded-xl hover:bg-gray-100">
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="text-center">
          <p className="font-bold text-gray-900">{date}</p>
          <p className="text-xs text-gray-500">{dayName}</p>
        </div>
        <button onClick={() => changeDate(1)} className="p-2 rounded-xl hover:bg-gray-100">
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Block Form */}
      {showBlockForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3 animate-scale-in">
          <h3 className="font-semibold text-gray-800 text-sm">Vaqt bloklash</h3>
          <div className="grid grid-cols-2 gap-2">
            <select
              value={blockField}
              onChange={(e) => setBlockField(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm col-span-2"
            >
              <option value="">Maydon tanlang</option>
              {fields.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
            <input
              type="time"
              value={blockStart}
              onChange={(e) => setBlockStart(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm"
            />
            <input
              type="time"
              value={blockEnd}
              onChange={(e) => setBlockEnd(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm"
            />
            <input
              type="text"
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              placeholder="Sabab: ta'mir, turnir..."
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm col-span-2"
            />
          </div>
          <button
            onClick={handleBlock}
            className="w-full py-2.5 bg-gray-700 text-white font-medium rounded-xl text-sm press-effect"
          >
            Bloklash
          </button>
        </div>
      )}

      {/* Calendar Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[60px_1fr_1fr_1fr] border-b border-gray-100">
            <div className="p-2 text-xs text-gray-400 font-medium text-center">Vaqt</div>
            {fields.map((f) => (
              <div
                key={f.id}
                className="p-2 text-xs font-semibold text-gray-700 text-center border-l border-gray-100"
              >
                {f.name}
              </div>
            ))}
          </div>

          {/* Time Rows */}
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="grid grid-cols-[60px_1fr_1fr_1fr] border-b border-gray-50"
            >
              <div className="p-2 text-xs text-gray-400 text-center font-mono">
                {hour}
              </div>
              {fields.map((field) => {
                const booking = getBookingForSlot(field.id, hour);
                return (
                  <div
                    key={field.id}
                    className={`p-1.5 border-l border-gray-50 min-h-[44px] ${
                      booking
                        ? getSlotColor(booking.status)
                        : "bg-green-50/50"
                    }`}
                  >
                    {booking && (
                      <div className="text-[10px] leading-tight">
                        <div className="font-medium truncate">
                          {booking.status === "blocked"
                            ? booking.blockReason || "Bloklangan"
                            : booking.customerName}
                        </div>
                        <div className="opacity-75">
                          {booking.startTime}–{booking.endTime}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-green-50 border border-green-200" /> Bo'sh
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-red-400" /> Band
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-amber-400" /> Kutilmoqda
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-gray-400" /> Bloklangan
        </span>
      </div>
    </div>
  );
}
