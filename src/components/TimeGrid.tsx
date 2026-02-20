"use client";

import React from "react";
import { Lock, Clock, User } from "lucide-react";

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

interface TimeGridProps {
  slots: TimeSlot[];
  fieldName: string;
  onSlotClick: (slot: TimeSlot) => void;
  selectedSlot: TimeSlot | null;
}

export default function TimeGrid({
  slots,
  fieldName,
  onSlotClick,
  selectedSlot,
}: TimeGridProps) {
  const getSlotStyles = (status: string) => {
    switch (status) {
      case "free":
        return "bg-green-50 border-green-200 hover:bg-green-100 hover:border-green-400 cursor-pointer";
      case "confirmed":
        return "bg-red-50 border-red-200 cursor-not-allowed opacity-80";
      case "pending":
        return "bg-amber-50 border-amber-200 cursor-not-allowed animate-pulse-soft";
      case "blocked":
        return "bg-gray-100 border-gray-200 cursor-not-allowed opacity-60";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "free":
        return "Bo'sh";
      case "confirmed":
        return "Band";
      case "pending":
        return "Kutilmoqda";
      case "blocked":
        return "Bloklangan";
      default:
        return status;
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case "free":
        return "bg-green-500";
      case "confirmed":
        return "bg-red-500";
      case "pending":
        return "bg-amber-500";
      case "blocked":
        return "bg-gray-500";
      default:
        return "bg-gray-300";
    }
  };

  return (
    <div className="space-y-1.5">
      {/* Field header */}
      <div className="flex items-center gap-2 px-1 py-1">
        <div className="w-6 h-6 rounded-lg bg-green-600 flex items-center justify-center">
          <span className="text-white text-xs font-bold">
            {fieldName.replace("Maydon ", "")}
          </span>
        </div>
        <h3 className="text-sm font-semibold text-gray-800">{fieldName}</h3>
        <div className="flex-1" />
        <span className="text-[10px] text-gray-400">
          {slots.filter((s) => s.status === "free").length} ta bo'sh
        </span>
      </div>

      {/* Time slots grid */}
      <div className="grid grid-cols-3 gap-1.5">
        {slots.map((slot) => {
          const isFree = slot.status === "free";
          const isSelected =
            selectedSlot?.start === slot.start && selectedSlot?.end === slot.end;

          return (
            <button
              key={`${slot.start}-${slot.end}`}
              onClick={() => isFree && onSlotClick(slot)}
              disabled={!isFree}
              className={`
                relative rounded-xl border p-2.5 transition-all duration-150 press-effect
                ${getSlotStyles(slot.status)}
                ${isSelected ? "!bg-green-500 !border-green-600 ring-2 ring-green-400 ring-offset-1" : ""}
              `}
            >
              {/* Time */}
              <div
                className={`text-sm font-bold ${
                  isSelected ? "text-white" : isFree ? "text-green-700" : "text-gray-500"
                }`}
              >
                {slot.start}
              </div>

              {/* Status */}
              <div className="flex items-center gap-1 mt-0.5">
                <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white" : getStatusDot(slot.status)}`} />
                <span
                  className={`text-[10px] ${
                    isSelected ? "text-green-100" : isFree ? "text-green-600" : "text-gray-400"
                  }`}
                >
                  {isSelected ? "Tanlandi" : getStatusLabel(slot.status)}
                </span>
              </div>

              {/* Booking info for non-free slots */}
              {slot.booking && slot.status !== "free" && (
                <div className="mt-1 flex items-center gap-1">
                  {slot.status === "blocked" ? (
                    <Lock className="w-3 h-3 text-gray-400" />
                  ) : (
                    <User className="w-3 h-3 text-gray-400" />
                  )}
                  <span className="text-[9px] text-gray-400 truncate">
                    {slot.booking.blockReason || slot.booking.customerName}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
