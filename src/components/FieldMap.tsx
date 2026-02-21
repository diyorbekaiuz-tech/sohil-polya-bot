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
      className={`relative w-full ${compact ? "h-36" : "h-44"} bg-gradient-to-b from-green-800 to-green-900 rounded-2xl overflow-hidden shadow-inner`}
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

      {/* Fields layout: [Maydon 2 | Maydon 3] --- gap --- [Maydon 1] */}
      <div className="absolute inset-0 flex items-center px-4 py-3 gap-0">

        {/* Left group: Maydon 2 & Maydon 3 */}
        <div className={`flex gap-1.5 ${compact ? "h-24" : "h-32"}`} style={{ flex: '0 0 52%' }}>
          {defaultFields.slice(1, 3).map((field) => {
            const isSelected = selectedField === field.id;
            return (
              <button
                key={field.id}
                onClick={() => onSelectField(field.id)}
                className={`
                  relative flex-1 rounded-xl border-2 transition-all duration-200 press-effect h-full
                  ${
                    isSelected
                      ? "border-white bg-green-500/40 shadow-lg shadow-green-400/30 scale-105 z-10"
                      : "border-green-500/40 bg-green-600/20 hover:bg-green-500/30 hover:border-green-400/60"
                  }
                `}
              >
                {/* Field lines */}
                <div className="absolute inset-1 border border-white/20 rounded-lg">
                  <div className="absolute top-1/2 left-0 right-0 h-px bg-white/20" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 border border-white/20 rounded-full" />
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-2 border-b border-l border-r border-white/15 rounded-b" />
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-2 border-t border-l border-r border-white/15 rounded-t" />
                </div>

                <div className={`absolute bottom-1 left-0 right-0 text-center ${isSelected ? "text-white" : "text-green-200"}`}>
                  <span className={`font-bold ${compact ? "text-[9px]" : "text-[10px]"}`}>{field.name}</span>
                </div>

                {isSelected && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md z-20">
                    <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Gap area (building/path between fields) */}
        <div className="flex-1 flex items-end justify-center pb-2" style={{ minWidth: '14%' }}>
          <div className={`w-full ${compact ? "h-6" : "h-8"} bg-green-700/40 rounded-md border border-green-600/20 flex items-center justify-center`}>
            <span className="text-[7px] text-green-400/50 font-medium">🏠</span>
          </div>
        </div>

        {/* Right side: Maydon 1 */}
        <div className={`${compact ? "h-24" : "h-32"}`} style={{ flex: '0 0 30%' }}>
          {defaultFields.slice(0, 1).map((field) => {
            const isSelected = selectedField === field.id;
            return (
              <button
                key={field.id}
                onClick={() => onSelectField(field.id)}
                className={`
                  relative w-full h-full rounded-xl border-2 transition-all duration-200 press-effect
                  ${
                    isSelected
                      ? "border-white bg-green-500/40 shadow-lg shadow-green-400/30 scale-105 z-10"
                      : "border-green-500/40 bg-green-600/20 hover:bg-green-500/30 hover:border-green-400/60"
                  }
                `}
              >
                {/* Field lines */}
                <div className="absolute inset-1 border border-white/20 rounded-lg">
                  <div className="absolute top-1/2 left-0 right-0 h-px bg-white/20" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 border border-white/20 rounded-full" />
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-2.5 border-b border-l border-r border-white/15 rounded-b" />
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-2.5 border-t border-l border-r border-white/15 rounded-t" />
                </div>

                <div className={`absolute bottom-1.5 left-0 right-0 text-center ${isSelected ? "text-white" : "text-green-200"}`}>
                  <span className={`font-bold ${compact ? "text-[9px]" : "text-[11px]"}`}>{field.name}</span>
                </div>

                {isSelected && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md z-20">
                    <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>

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
