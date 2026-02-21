"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Lock, Loader2 } from "lucide-react";

interface Booking {
  id: string;
  fieldId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  customerName: string;
  customerPhone?: string;
  teamName?: string;
  blockReason: string;
}

interface Field {
  id: string;
  name: string;
}

interface Settings {
  openingTime: string;
  closingTime: string;
}

// Generate hours between opening and closing, supporting past-midnight
function generateCalendarHours(openingTime: string, closingTime: string): string[] {
  const [openH] = openingTime.split(":").map(Number);
  const [closeH] = closingTime.split(":").map(Number);

  const hours: string[] = [];
  let h = openH;

  // If closing <= opening, it crosses midnight
  const crossesMidnight = closeH <= openH;
  const endHour = crossesMidnight ? closeH + 24 : closeH;

  while (h < endHour) {
    const displayH = h % 24;
    hours.push(`${String(displayH).padStart(2, "0")}:00`);
    h++;
  }

  return hours;
}

// Helper: get next day date string
function getNextDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

export default function AdminCalendarPage() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [settings, setSettings] = useState<Settings>({ openingTime: "06:00", closingTime: "24:00" });
  const [loading, setLoading] = useState(true);

  // Block form
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [blockField, setBlockField] = useState("");
  const [blockStart, setBlockStart] = useState("");
  const [blockEnd, setBlockEnd] = useState("");
  const [blockReason, setBlockReason] = useState("");

  const crossesMidnight = (() => {
    const [openH] = settings.openingTime.split(":").map(Number);
    const [closeH] = settings.closingTime.split(":").map(Number);
    return closeH <= openH;
  })();

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      const nextDate = getNextDate(date);

      // Fetch settings, fields, and bookings for both dates
      const [settingsRes, fieldsRes, bookingsRes, nextDayBookingsRes] = await Promise.all([
        fetch("/api/settings"),
        fetch("/api/fields"),
        fetch(`/api/admin/bookings?date=${date}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        crossesMidnight ? fetch(`/api/admin/bookings?date=${nextDate}`, {
          headers: { Authorization: `Bearer ${token}` },
        }) : Promise.resolve(null),
      ]);

      if (settingsRes.ok) {
        const sData = await settingsRes.json();
        setSettings({ openingTime: sData.openingTime || "06:00", closingTime: sData.closingTime || "24:00" });
      }
      if (fieldsRes.ok) setFields(await fieldsRes.json());

      let allBookings: Booking[] = [];
      if (bookingsRes.ok) {
        const data = await bookingsRes.json();
        allBookings = (data.bookings || []).filter((b: Booking) => b.date === date);
      }
      if (nextDayBookingsRes && nextDayBookingsRes.ok) {
        const data = await nextDayBookingsRes.json();
        const nextDayBookings = (data.bookings || []).filter((b: Booking) => b.date === nextDate);
        allBookings = [...allBookings, ...nextDayBookings];
      }
      setBookings(allBookings);
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

  // Determine which date a calendar hour belongs to
  const getDateForHour = (hourStr: string): string => {
    if (!crossesMidnight) return date;
    const [h] = hourStr.split(":").map(Number);
    const [closeH] = settings.closingTime.split(":").map(Number);
    // Hours past midnight (0, 1, ..., closeH-1) belong to next day
    if (h < closeH) return getNextDate(date);
    return date;
  };

  const getBookingForSlot = (fieldId: string, hour: string) => {
    const hourNum = parseInt(hour.split(":")[0]);
    const slotDate = getDateForHour(hour);

    return bookings.find((b) => {
      if (b.fieldId !== fieldId) return false;
      if (b.date !== slotDate) return false;
      const startH = parseInt(b.startTime.split(":")[0]);
      const endH = parseInt(b.endTime.split(":")[0]) || 24;
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

  // Form Type: 'block' or 'book'
  const [formType, setFormType] = useState<'block' | 'book'>('block');
  
  // Book form state
  const [bookCustomerName, setBookCustomerName] = useState("");
  const [bookCustomerPhone, setBookCustomerPhone] = useState("+998");
  const [bookTeamName, setBookTeamName] = useState("");

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

  const handleBook = async () => {
    if (!blockField || !blockStart || !blockEnd || !bookCustomerName || !bookCustomerPhone) {
        alert("Barcha majburiy maydonlarni to'ldiring");
        return;
    }
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch("/api/admin/bookings", {
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
          customerName: bookCustomerName,
          customerPhone: bookCustomerPhone,
          teamName: bookTeamName,
          status: "confirmed",
          price: 0 // You can calculate price if needed, or leave 0 for admin override
        }),
      });

      if (res.ok) {
        setShowBlockForm(false);
        setBlockField("");
        setBlockStart("");
        setBlockEnd("");
        setBookCustomerName("");
        setBookCustomerPhone("+998");
        setBookTeamName("");
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

  // Generate dynamic hours based on settings
  const HOURS = generateCalendarHours(settings.openingTime, settings.closingTime);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Kalendar</h1>
        <button
          onClick={() => setShowBlockForm(!showBlockForm)}
          className="flex items-center gap-1 px-3 py-2 bg-gray-700 text-white rounded-xl text-xs font-medium press-effect"
        >
          <Lock className="w-3 h-3" />
          Vaqt boshqarish
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

      {/* Block/Book Form */}
      {showBlockForm && (
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-4 animate-scale-in">
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
               onClick={() => setFormType('block')}
               className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-colors ${formType === 'block' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Vaqt bloklash
            </button>
            <button
               onClick={() => setFormType('book')}
               className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-colors ${formType === 'book' ? 'bg-white shadow text-green-600' : 'text-gray-500 hover:text-green-600'}`}
            >
              Bron qilish
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <select
              value={blockField}
              onChange={(e) => setBlockField(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm col-span-2 outline-none focus:border-green-500"
            >
              <option value="">Maydon tanlang</option>
              {fields.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Boshlanish</label>
              <input
                type="time"
                value={blockStart}
                onChange={(e) => setBlockStart(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Tugash</label>
              <input
                type="time"
                value={blockEnd}
                onChange={(e) => setBlockEnd(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-500"
              />
            </div>

            {formType === 'block' ? (
              <input
                type="text"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Sabab: ta'mir, turnir..."
                className="px-3 py-2 border border-gray-200 rounded-xl text-sm col-span-2 outline-none focus:border-gray-500"
              />
            ) : (
              <>
                <input
                  type="text"
                  value={bookCustomerName}
                  onChange={(e) => setBookCustomerName(e.target.value)}
                  placeholder="Ism (Majburiy)"
                  className="px-3 py-2 border border-gray-200 rounded-xl text-sm col-span-2 outline-none focus:border-green-500"
                />
                <input
                  type="text"
                  value={bookCustomerPhone}
                  onChange={(e) => setBookCustomerPhone(e.target.value)}
                  placeholder="Telefon raqam"
                  className="px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-500"
                />
                <input
                  type="text"
                  value={bookTeamName}
                  onChange={(e) => setBookTeamName(e.target.value)}
                  placeholder="Telegram @username"
                  className="px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-500"
                />
              </>
            )}
          </div>
          <button
            onClick={formType === 'block' ? handleBlock : handleBook}
            className={`w-full py-2.5 font-medium rounded-xl text-sm press-effect text-white ${formType === 'block' ? 'bg-gray-700' : 'bg-green-600'}`}
          >
            {formType === 'block' ? 'Bloklash' : 'Bron qilish'}
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
          {HOURS.map((hour) => {
            const hourNum = parseInt(hour.split(":")[0]);
            const isPastMidnightHour = crossesMidnight && hourNum < parseInt(settings.closingTime.split(":")[0]);

            return (
              <div
                key={hour}
                className="grid grid-cols-[60px_1fr_1fr_1fr] border-b border-gray-50"
              >
                <div className="p-2 text-xs text-gray-400 text-center font-mono">
                  {hour}
                  {isPastMidnightHour && (
                    <span className="block text-[8px] text-blue-400">+1 kun</span>
                  )}
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
                        <div className="text-[10px] leading-tight flex flex-col gap-1">
                          <div className="font-medium truncate">
                            {booking.status === "blocked"
                              ? booking.blockReason || "Bloklangan"
                              : booking.customerName}
                          </div>
                          <div className="opacity-75">
                            {booking.startTime}–{booking.endTime}
                          </div>
                          {booking.status !== "blocked" && (
                            <div className="mt-1 flex flex-col gap-0.5 max-w-full overflow-hidden">
                              {booking.customerPhone && (
                                <a 
                                  href={`tel:${booking.customerPhone}`} 
                                  className="text-white hover:underline truncate"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {booking.customerPhone}
                                </a>
                              )}
                              {booking.teamName && booking.teamName.startsWith('@') && (
                                <a 
                                  href={`https://t.me/${booking.teamName.substring(1)}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-white hover:underline truncate"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {booking.teamName}
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-green-50 border border-green-200" /> Bo&apos;sh
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
