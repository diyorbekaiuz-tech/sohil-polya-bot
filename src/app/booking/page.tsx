"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import FieldMap from "@/components/FieldMap";
import DatePicker from "@/components/DatePicker";
import TimeGrid from "@/components/TimeGrid";
import BookingModal from "@/components/BookingModal";
import Navbar from "@/components/Navbar";
import { getTodayDate } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface Field {
  id: string;
  name: string;
  surface: string;
  description: string;
}

interface TimeSlot {
  start: string;
  end: string;
  status: string;
  booking?: {
    id: string;
    customerName: string;
    startTime: string;
    endTime: string;
    status: string;
    blockReason?: string;
  } | null;
}

interface AvailabilityData {
  field: Field;
  slots: TimeSlot[];
}

interface SettingsData {
  pricePerHour: number;
  priceEvening: number;
  slotDurations: number[];
  currency: string;
}

function BookingPageContent() {
  const searchParams = useSearchParams();
  const preselectedField = searchParams.get("field");

  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [selectedField, setSelectedField] = useState<string | null>(
    preselectedField
  );
  const [fields, setFields] = useState<Field[]>([]);
  const [availability, setAvailability] = useState<AvailabilityData[]>([]);
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [duration, setDuration] = useState(60);

  // Fetch fields
  useEffect(() => {
    fetch("/api/fields")
      .then((r) => {
        if (!r.ok) throw new Error("API error");
        return r.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setFields(data);
          if (!selectedField && data.length > 0) {
            setSelectedField(data[0].id);
          }
        }
      })
      .catch(console.error);
  }, []);

  // Fetch availability
  const fetchAvailability = useCallback(async () => {
    if (!selectedDate) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/availability?date=${selectedDate}`);
      const data = await res.json();
      setAvailability(data.availability || []);
      setSettings(data.settings || null);
    } catch (error) {
      console.error("Availability error:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchAvailability();
    // Poll every 30 seconds for real-time updates
    const interval = setInterval(fetchAvailability, 30000);
    return () => clearInterval(interval);
  }, [fetchAvailability]);

  const handleSlotClick = (slot: TimeSlot) => {
    if (slot.status !== "free") return;

    // Calculate end time based on duration
    const [h, m] = slot.start.split(":").map(Number);
    const endMinutes = h * 60 + m + duration;
    const endH = Math.floor(endMinutes / 60);
    const endM = endMinutes % 60;
    const endTime = `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;

    setSelectedSlot({ ...slot, end: endTime });
    setShowModal(true);
  };

  const selectedFieldData = availability.find(
    (a) => a.field.id === selectedField
  );

  const getPrice = () => {
    if (!settings || !selectedSlot) return 0;
    const startHour = parseInt(selectedSlot.start.split(":")[0]);
    const pricePerHour =
      startHour >= 18 ? settings.priceEvening : settings.pricePerHour;
    return pricePerHour * (duration / 60);
  };

  return (
    <div className="min-h-screen bg-gray-50 safe-bottom">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 py-3">
        <h1 className="text-lg font-bold text-gray-900">🗓 Bron qilish</h1>
        <p className="text-xs text-gray-500">
          Sana → Maydon → Vaqt → Ma'lumotlar
        </p>
      </header>

      {/* Date Picker */}
      <DatePicker selectedDate={selectedDate} onSelectDate={setSelectedDate} />

      {/* Field Map */}
      <div className="px-4 py-3">
        <FieldMap
          fields={fields}
          selectedField={selectedField}
          onSelectField={setSelectedField}
        />
      </div>

      {/* Duration Selector */}
      <div className="px-4 pb-2">
        <div className="flex gap-2">
          {[60, 120].map((d) => (
            <button
              key={d}
              onClick={() => setDuration(d)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all press-effect ${
                duration === d
                  ? "bg-green-600 text-white shadow-md shadow-green-600/30"
                  : "bg-white text-gray-600 border border-gray-200"
              }`}
            >
              {d} daqiqa
            </button>
          ))}
        </div>
      </div>

      {/* Color Legend */}
      <div className="px-4 pb-2">
        <div className="flex gap-3 text-[10px]">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-slot-free" /> Bo'sh
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-slot-booked" /> Band
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-slot-pending" /> Kutilmoqda
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-slot-blocked" /> Bloklangan
          </span>
        </div>
      </div>

      {/* Time Grid */}
      <div className="px-4 pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
          </div>
        ) : selectedFieldData ? (
          <TimeGrid
            slots={selectedFieldData.slots}
            fieldName={selectedFieldData.field.name}
            onSlotClick={handleSlotClick}
            selectedSlot={selectedSlot}
            duration={duration}
          />
        ) : (
          <div className="text-center py-12 text-gray-400 text-sm">
            Maydonni tanlang
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showModal && selectedSlot && selectedField && (
        <BookingModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedSlot(null);
          }}
          selectedField={selectedField}
          fieldName={fields.find((f) => f.id === selectedField)?.name || "Maydon"}
          selectedDate={selectedDate}
          startTime={selectedSlot.start}
          endTime={selectedSlot.end}
          duration={duration}
          price={getPrice()}
          onSuccess={fetchAvailability}
        />
      )}

      <Navbar />
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    }>
      <BookingPageContent />
    </Suspense>
  );
}
