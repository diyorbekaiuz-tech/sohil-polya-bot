"use client";

import { useState, useEffect } from "react";
import { MapPin, Phone, Clock, ChevronRight, Zap, Shield, Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import FieldMap from "@/components/FieldMap";
import Link from "next/link";

interface Field {
  id: string;
  name: string;
  surface: string;
  description: string;
}

interface Settings {
  openingTime: string;
  closingTime: string;
  pricePerHour: number;
  priceEvening: number;
  contactPhone: string;
  contactTelegram: string;
  locationAddress: string;
  cancellationPolicy: string;
  currency: string;
}

export default function HomePage() {
  const [fields, setFields] = useState<Field[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    fetch("/api/fields")
      .then((r) => {
        if (!r.ok) throw new Error("API error");
        return r.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setFields(data);
      })
      .catch(console.error);

    fetch("/api/settings")
      .then((r) => {
        if (!r.ok) throw new Error("API error");
        return r.json();
      })
      .then(setSettings)
      .catch(console.error);
  }, []);

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("uz-UZ").format(p) + " so'm";

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-green-50 safe-bottom">
      {/* Hero Section */}
      <header className="relative overflow-hidden bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
        </div>

        <div className="relative px-4 pt-8 pb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur">
              <span className="text-xl">⚽</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Chim Bron</h1>
          </div>
          <p className="text-green-100 text-sm mt-1">
            3 ta futbol maydoni — onlayn bron qiling
          </p>

          <Link
            href="/booking"
            className="mt-5 w-full flex items-center justify-center gap-2 bg-white text-green-700 font-semibold py-3.5 px-6 rounded-2xl shadow-lg shadow-green-900/20 press-effect text-base"
          >
            <Zap className="w-5 h-5" />
            Hozir bron qilish
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </header>

      {/* Field Map Preview */}
      <section className="px-4 -mt-0 mb-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mt-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Maydonlar joylashuvi
          </h2>
          <FieldMap
            fields={fields}
            selectedField={null}
            onSelectField={() => {}}
            compact
          />
        </div>
      </section>

      {/* Features */}
      <section className="px-4 mb-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center mx-auto mb-2">
              <Zap className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-xs font-medium text-gray-700">Tez bron</p>
            <p className="text-[10px] text-gray-400 mt-0.5">3 bosqichda</p>
          </div>
          <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mx-auto mb-2">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-xs font-medium text-gray-700">Ishonchli</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Takrorlanmaydi</p>
          </div>
          <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center mx-auto mb-2">
              <Star className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-xs font-medium text-gray-700">Sifatli</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Sun'iy chim</p>
          </div>
        </div>
      </section>

      {/* Field Cards */}
      <section className="px-4 mb-4">
        <h2 className="text-lg font-bold text-gray-900 mb-3">Maydonlar</h2>
        <div className="space-y-3">
          {fields.map((field, idx) => (
            <Link
              key={field.id}
              href={`/booking?field=${field.id}`}
              className="block bg-white rounded-2xl p-4 shadow-sm border border-gray-100 press-effect animate-scale-in"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{field.name}</h3>
                  <p className="text-xs text-green-600 font-medium mt-0.5">
                    {field.surface}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Info Section */}
      {settings && (
        <section className="px-4 mb-4 space-y-3">
          <h2 className="text-lg font-bold text-gray-900">Ma'lumotlar</h2>

          {/* Prices */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-700 text-sm mb-2">💰 Narxlar</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Kunduzgi (06:00–18:00)</span>
                <span className="font-semibold text-gray-900">
                  {formatPrice(settings.pricePerHour)}/soat
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Kechki (18:00–24:00)</span>
                <span className="font-semibold text-gray-900">
                  {formatPrice(settings.priceEvening)}/soat
                </span>
              </div>
            </div>
          </div>

          {/* Working Hours */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-green-600" />
              <span className="font-semibold text-gray-700">Ish vaqti:</span>
              <span className="text-gray-500">
                {settings.openingTime} — {settings.closingTime}
              </span>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-2">
            <h3 className="font-semibold text-gray-700 text-sm">📞 Aloqa</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-4 h-4 text-green-600" />
              <a href={`tel:${settings.contactPhone}`} className="text-green-700 font-medium">
                {settings.contactPhone}
              </a>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-green-600" />
              <span>{settings.locationAddress || "Toshkent shahri"}</span>
            </div>
          </div>
        </section>
      )}

      {/* Color Legend */}
      <section className="px-4 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-700 text-sm mb-3">Ranglar izohi</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-slot-free" />
              <span className="text-xs text-gray-600">Bo'sh</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-slot-booked" />
              <span className="text-xs text-gray-600">Band</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-slot-pending" />
              <span className="text-xs text-gray-600">Kutilmoqda</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-slot-blocked" />
              <span className="text-xs text-gray-600">Bloklangan</span>
            </div>
          </div>
        </div>
      </section>

      <Navbar />
    </div>
  );
}
