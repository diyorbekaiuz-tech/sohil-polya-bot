"use client";

import React, { useRef, useEffect } from "react";
import { getNextDays } from "@/lib/utils";

interface DatePickerProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export default function DatePicker({ selectedDate, onSelectDate }: DatePickerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const days = getNextDays(30);

  useEffect(() => {
    // Scroll to selected date
    const idx = days.findIndex((d) => d.date === selectedDate);
    if (idx > 0 && scrollRef.current) {
      const child = scrollRef.current.children[idx] as HTMLElement;
      if (child) {
        scrollRef.current.scrollTo({
          left: child.offsetLeft - 16,
          behavior: "smooth",
        });
      }
    }
  }, [selectedDate, days]);

  const isToday = (date: string) => days[0]?.date === date;

  return (
    <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-lg border-b border-gray-100 py-3 px-1">
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto hide-scrollbar px-3"
      >
        {days.map((day) => {
          const selected = selectedDate === day.date;
          return (
            <button
              key={day.date}
              onClick={() => onSelectDate(day.date)}
              className={`
                flex-shrink-0 flex flex-col items-center justify-center rounded-2xl px-3 py-2 min-w-[56px] transition-all duration-200 press-effect
                ${
                  selected
                    ? "bg-green-600 text-white shadow-lg shadow-green-600/30 scale-105"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }
              `}
            >
              <span
                className={`text-[10px] font-medium uppercase ${
                  selected ? "text-green-100" : "text-gray-400"
                }`}
              >
                {isToday(day.date) ? "Bugun" : day.dayName}
              </span>
              <span className={`text-base font-bold ${selected ? "text-white" : "text-gray-800"}`}>
                {day.label.split(" ")[0]}
              </span>
              <span
                className={`text-[10px] ${selected ? "text-green-100" : "text-gray-400"}`}
              >
                {day.label.split(" ")[1]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
