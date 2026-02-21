"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Phone, MapPin, Send, Clock, ExternalLink } from "lucide-react";

interface Settings {
  contactPhone: string;
  contactTelegram: string;
  locationAddress: string;
  openingTime: string;
  closingTime: string;
}

export default function ContactPage() {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then(setSettings)
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 safe-bottom">
      <header className="bg-white border-b border-gray-100 px-4 py-4">
        <h1 className="text-lg font-bold text-gray-900">📍 Aloqa va joylashuv</h1>
      </header>

      <div className="px-4 py-4 space-y-4">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <a
            href={`tel:${settings?.contactPhone || "+998901234567"}`}
            className="bg-green-600 text-white rounded-2xl p-4 text-center press-effect shadow-md shadow-green-600/20"
          >
            <Phone className="w-6 h-6 mx-auto mb-2" />
            <p className="text-sm font-semibold">Qo'ng'iroq</p>
            <p className="text-[10px] text-green-100 mt-0.5">
              {settings?.contactPhone}
            </p>
          </a>
          <a
            href={`https://t.me/${(settings?.contactTelegram || "@chim_admin").replace("@", "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-500 text-white rounded-2xl p-4 text-center press-effect shadow-md shadow-blue-500/20"
          >
            <Send className="w-6 h-6 mx-auto mb-2" />
            <p className="text-sm font-semibold">Telegram</p>
            <p className="text-[10px] text-blue-100 mt-0.5">
              {settings?.contactTelegram}
            </p>
          </a>
        </div>

        {/* Location */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-red-600" />
              </div>
              <h2 className="font-bold text-gray-800">Manzil</h2>
            </div>
            <p className="text-sm text-gray-600">
              {settings?.locationAddress || "Toshkent shahri"}
            </p>
          </div>
          {/* Yandex Map */}
          <div className="h-48 relative">
            <iframe
              src="https://yandex.uz/map-widget/v1/?ll=67.313815%2C37.233445&z=17&pt=67.313815%2C37.233445%2Cpm2rdm"
              width="100%"
              height="100%"
              frameBorder="0"
              allowFullScreen
              style={{ position: 'absolute', top: 0, left: 0 }}
            />
            <a
              href="https://yandex.uz/maps?whatshere%5Bpoint%5D=67.313815%2C37.233445&whatshere%5Bzoom%5D=18&ll=67.313815%2C37.233445&z=18"
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-3 right-3 bg-white text-green-700 text-xs font-medium px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1 z-10"
            >
              <ExternalLink className="w-3 h-3" />
              Xaritada ochish
            </a>
          </div>
        </div>

        {/* Working Hours */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <h2 className="font-bold text-gray-800">Ish vaqti</h2>
          </div>
          <div className="space-y-2">
            {["Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba", "Yakshanba"].map(
              (day) => (
                <div key={day} className="flex justify-between text-sm">
                  <span className="text-gray-500">{day}</span>
                  <span className="font-medium text-gray-700">
                    {settings?.openingTime || "06:00"} —{" "}
                    {settings?.closingTime || "24:00"}
                  </span>
                </div>
              )
            )}
          </div>
        </div>

        {/* Info */}
        <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
          <p className="text-sm text-green-700 text-center">
            ⚡ Savollaringiz bo'lsa, Telegram orqali yozing — tezroq javob beramiz!
          </p>
        </div>
      </div>

      <Navbar />
    </div>
  );
}
