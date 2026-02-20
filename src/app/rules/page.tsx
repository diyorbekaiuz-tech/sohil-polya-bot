"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Clock, DollarSign, AlertCircle, CheckCircle, XCircle } from "lucide-react";

interface Settings {
  openingTime: string;
  closingTime: string;
  pricePerHour: number;
  priceEvening: number;
  cancellationPolicy: string;
  currency: string;
}

export default function RulesPage() {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then(setSettings)
      .catch(console.error);
  }, []);

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("uz-UZ").format(p) + " so'm";

  return (
    <div className="min-h-screen bg-gray-50 safe-bottom">
      <header className="bg-white border-b border-gray-100 px-4 py-4">
        <h1 className="text-lg font-bold text-gray-900">📋 Qoidalar va narxlar</h1>
      </header>

      <div className="px-4 py-4 space-y-4">
        {/* Prices */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-green-600" />
            </div>
            <h2 className="font-bold text-gray-800">Narxlar</h2>
          </div>
          {settings && (
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-gray-700">☀️ Kunduzgi</p>
                  <p className="text-xs text-gray-500">06:00 — 18:00</p>
                </div>
                <span className="font-bold text-green-700 text-lg">
                  {formatPrice(settings.pricePerHour)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-amber-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-gray-700">🌙 Kechki</p>
                  <p className="text-xs text-gray-500">18:00 — 24:00</p>
                </div>
                <span className="font-bold text-amber-700 text-lg">
                  {formatPrice(settings.priceEvening)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Working Hours */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="font-bold text-gray-800">Ish vaqti</h2>
          </div>
          <p className="text-sm text-gray-600">
            Har kuni: <b>{settings?.openingTime || "06:00"}</b> dan{" "}
            <b>{settings?.closingTime || "24:00"}</b> gacha
          </p>
        </div>

        {/* Booking Rules */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-purple-600" />
            </div>
            <h2 className="font-bold text-gray-800">Bron qoidalari</h2>
          </div>
          <ul className="space-y-2.5">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-600">
                Bron qilish kamida <b>30 daqiqa</b> oldin amalga oshirilishi kerak
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-600">
                Bron <b>30 kun</b> ichida qilish mumkin
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-600">
                Slot davomiyligi: <b>60 daqiqa</b> yoki <b>120 daqiqa</b>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-600">
                Bron<b> admin tasdig'idan</b> keyin kuchga kiradi
              </span>
            </li>
            <li className="flex items-start gap-2">
              <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-600">
                Bir vaqtda ikki bron bo'lishi <b>mumkin emas</b>
              </span>
            </li>
          </ul>
        </div>

        {/* Cancellation Policy */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-800 mb-2">❌ Bekor qilish siyosati</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            {settings?.cancellationPolicy ||
              "Bronni bekor qilish uchun kamida 2 soat oldin xabar bering."}
          </p>
        </div>

        {/* Status Legend */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-800 mb-3">🎨 Holatlar</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-2 rounded-xl bg-green-50">
              <div className="w-4 h-4 rounded-full bg-slot-free" />
              <div>
                <p className="text-sm font-medium text-gray-700">Bo'sh</p>
                <p className="text-[10px] text-gray-400">Bron qilish mumkin</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 rounded-xl bg-amber-50">
              <div className="w-4 h-4 rounded-full bg-slot-pending" />
              <div>
                <p className="text-sm font-medium text-gray-700">Kutilmoqda</p>
                <p className="text-[10px] text-gray-400">Admin tasdig'i kutilmoqda</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 rounded-xl bg-red-50">
              <div className="w-4 h-4 rounded-full bg-slot-booked" />
              <div>
                <p className="text-sm font-medium text-gray-700">Band</p>
                <p className="text-[10px] text-gray-400">Tasdiqlangan bron</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 rounded-xl bg-gray-50">
              <div className="w-4 h-4 rounded-full bg-slot-blocked" />
              <div>
                <p className="text-sm font-medium text-gray-700">Bloklangan</p>
                <p className="text-[10px] text-gray-400">Ta'mir, turnir va h.k.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Navbar />
    </div>
  );
}
