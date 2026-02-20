"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, CheckCircle } from "lucide-react";

interface Settings {
  openingTime: string;
  closingTime: string;
  pricePerHour: number;
  priceEvening: number;
  contactPhone: string;
  contactTelegram: string;
  locationAddress: string;
  cancellationPolicy: string;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    openingTime: "06:00",
    closingTime: "24:00",
    pricePerHour: 200000,
    priceEvening: 300000,
    contactPhone: "+998901234567",
    contactTelegram: "@chim_admin",
    locationAddress: "Toshkent shahri",
    cancellationPolicy: "Bronni bekor qilish uchun kamida 2 soat oldin xabar bering.",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setSettings(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        alert("Saqlashda xatolik yuz berdi!");
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("Saqlashda xatolik yuz berdi!");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Sozlamalar</h1>
          <p className="text-sm text-gray-500">Ish vaqti, narxlar, aloqa</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white font-medium rounded-xl text-sm press-effect disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saved ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saved ? "Saqlandi!" : "Saqlash"}
        </button>
      </div>

      {/* Working Hours */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
        <h2 className="font-bold text-gray-800">🕐 Ish vaqti</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              Ochilish
            </label>
            <input
              type="time"
              value={settings.openingTime}
              onChange={(e) => setSettings({ ...settings, openingTime: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              Yopilish
            </label>
            <input
              type="time"
              value={settings.closingTime}
              onChange={(e) => setSettings({ ...settings, closingTime: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
        <h2 className="font-bold text-gray-800">💰 Narxlar (UZS/soat)</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              Kunduzgi (06:00–18:00)
            </label>
            <input
              type="number"
              value={settings.pricePerHour}
              onChange={(e) =>
                setSettings({ ...settings, pricePerHour: Number(e.target.value) })
              }
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              Kechki (18:00–24:00)
            </label>
            <input
              type="number"
              value={settings.priceEvening}
              onChange={(e) =>
                setSettings({ ...settings, priceEvening: Number(e.target.value) })
              }
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
        <h2 className="font-bold text-gray-800">📞 Aloqa</h2>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              Telefon raqam
            </label>
            <input
              type="tel"
              value={settings.contactPhone}
              onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              Telegram
            </label>
            <input
              type="text"
              value={settings.contactTelegram}
              onChange={(e) =>
                setSettings({ ...settings, contactTelegram: e.target.value })
              }
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              Manzil
            </label>
            <input
              type="text"
              value={settings.locationAddress}
              onChange={(e) =>
                setSettings({ ...settings, locationAddress: e.target.value })
              }
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </div>

      {/* Cancellation Policy */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
        <h2 className="font-bold text-gray-800">📋 Bekor qilish siyosati</h2>
        <textarea
          value={settings.cancellationPolicy}
          onChange={(e) =>
            setSettings({ ...settings, cancellationPolicy: e.target.value })
          }
          rows={3}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
        />
      </div>

      {/* Info */}
      <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
        <p className="text-xs text-blue-600">
          ℹ️ Admin credentials: <b>admin / admin123</b> — .env faylida o'zgartirishingiz mumkin.
        </p>
      </div>
    </div>
  );
}
