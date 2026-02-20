"use client";

import React from "react";

interface Field {
  id: string;
  name: string;
  surface?: string;
  description?: string;
}

interface FieldMapProps {
  fields: Field[];
  selectedField: string | null;
  onSelectField: (id: string) => void;
  compact?: boolean;
}

export default function FieldMap({
  fields,
  selectedField,
  onSelectField,
  compact = false,
}: FieldMapProps) {
  const defaultFields: Field[] =
    fields.length > 0
      ? fields
      : [
          { id: "field_1", name: "Maydon 1" },
          { id: "field_2", name: "Maydon 2" },
          { id: "field_3", name: "Maydon 3" },
        ];

  return (
    <div
      className={`relative w-full ${compact ? "h-32" : "h-40"} bg-gradient-to-b from-green-800 to-green-900 rounded-2xl overflow-hidden shadow-inner`}
    >
      {/* Background pattern - grass effect */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute h-full w-px bg-green-400"
            style={{ left: `${(i + 1) * 8}%` }}
          />
        ))}
      </div>

      {/* Facility boundary */}
      <div className="absolute inset-2 border border-green-500/30 rounded-xl" />

      {/* 3 Fields */}
      <div className="absolute inset-0 flex items-center justify-center gap-2 px-4 py-3">
        {defaultFields.map((field, idx) => {
          const isSelected = selectedField === field.id;
          return (
            <button
              key={field.id}
              onClick={() => onSelectField(field.id)}
              className={`
                relative flex-1 rounded-xl border-2 transition-all duration-200 press-effect
                ${compact ? "h-20" : "h-28"}
                ${
                  isSelected
                    ? "border-white bg-green-500/40 shadow-lg shadow-green-400/30 scale-105"
                    : "border-green-500/40 bg-green-600/20 hover:bg-green-500/30 hover:border-green-400/60"
                }
              `}
            >
              {/* Field lines */}
              <div className="absolute inset-1 border border-white/20 rounded-lg">
                {/* Center line */}
                <div className="absolute top-1/2 left-0 right-0 h-px bg-white/20" />
                {/* Center circle */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 border border-white/20 rounded-full" />
                {/* Goal areas */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-2 border-b border-l border-r border-white/15 rounded-b" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-2 border-t border-l border-r border-white/15 rounded-t" />
              </div>

              {/* Field label */}
              <div
                className={`absolute bottom-1 left-0 right-0 text-center ${
                  isSelected ? "text-white" : "text-green-200"
                }`}
              >
                <span className={`font-bold ${compact ? "text-[9px]" : "text-[10px]"}`}>
                  {field.name}
                </span>
              </div>

              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md">
                  <svg
                    className="w-3 h-3 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Direction labels */}
      {!compact && (
        <>
          <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[8px] text-green-400/60 font-medium uppercase tracking-widest">
            Shimol
          </div>
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[8px] text-green-400/60 font-medium uppercase tracking-widest">
            Janub
          </div>
        </>
      )}
    </div>
  );
}
