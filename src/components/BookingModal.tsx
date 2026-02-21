"use client";

import React, { useState, useEffect } from "react";
import { X, Phone, User, Users, MessageSquare, Loader2, CheckCircle2 } from "lucide-react";

import { useTelegram } from "./TelegramProvider";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedField: string | null;
  fieldName: string;
  selectedDate: string;
  // selectedTime: string | null; // Removed as per instruction
  startTime: string | null;
  endTime: string | null;
  duration: number;
  price: number;
  onSuccess: () => void;
}

export default function BookingModal({
  isOpen,
  onClose,
  selectedField,
  fieldName,
  selectedDate,
  // selectedTime, // Removed as per instruction
  startTime,
  endTime,
  duration,
  price,
  onSuccess,
}: BookingModalProps) {
  const { user: telegramUser } = useTelegram();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+998");
  const [teamName, setTeamName] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Auto-fill phone from URL params (set by bot when sharing contact)
      const urlParams = new URLSearchParams(window.location.search);
      const phoneFromUrl = urlParams.get("phone");
      if (phoneFromUrl && phone === "+998") {
        setPhone(phoneFromUrl);
      }

      // Auto-fill from Telegram user data
      if (telegramUser) {
        if (telegramUser.first_name && !name) {
          let fullName = telegramUser.first_name;
          if (telegramUser.last_name) fullName += " " + telegramUser.last_name;
          setName(fullName);
        }
        if (telegramUser.username && !teamName) {
          setTeamName("@" + telegramUser.username);
        }
      }
    }
  }, [isOpen, telegramUser]);

  if (!isOpen) return null;

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("uz-UZ").format(p) + " so'm";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fieldId: selectedField,
          date: selectedDate,
          startTime,
          endTime,
          name, // Changed from customerName
          phone, // Changed from customerPhone
          teamName,
          note,
          telegramUserId: telegramUser?.id,
          telegramUsername: telegramUser?.username,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Xatolik yuz berdi");
      }

      setShowSuccess(true); // Changed from setSuccess
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (showSuccess) { // Changed from success
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
        <div className="bg-white rounded-3xl p-6 w-full max-w-sm text-center animate-scale-in">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            So'rov yuborildi!
          </h2>
          <p className="text-gray-500 mb-6">
            Tez orada administrator siz bilan bog'lanadi va bronni tasdiqlaydi.
          </p>
          <button
            onClick={onClose} // Changed logic to just onClose
            className="w-full py-3 bg-green-600 text-white font-semibold rounded-xl press-effect"
          >
            Yopish
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto transition-opacity"
        onClick={onClose}
      />
      <div className="relative z-10 bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md pointer-events-auto animate-slide-up shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 px-5 pt-5">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Bron qilish</h2> {/* Changed h3 to h2 */}
            <p className="text-sm text-green-600 font-medium"> {/* Changed classes and content */}
              {fieldName} • {selectedDate}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200" // Changed classes
          >
            <X className="w-5 h-5" /> {/* Changed icon size */}
          </button>
        </div>

        {/* Price info */}
        <div className="mx-5 mt-3 p-3 bg-green-50 rounded-xl flex justify-between items-center">
          <span className="text-sm text-green-700">
            {duration} daqiqa ({duration / 60} soat)
          </span>
          <span className="font-bold text-green-700">{formatPrice(price)}</span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-5 pb-8 space-y-3">
          {/* Name */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              Ismingiz *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ism familiya"
                required
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              Telefon raqam *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+998901234567"
                required
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Telegram username */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              Telegram foydalanuvchi nomi (ixtiyoriy)
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="@username"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              Izoh (ixtiyoriy)
            </label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Qo'shimcha ma'lumot..."
                rows={2}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !name || !phone}
            className="w-full py-3.5 bg-green-600 text-white font-semibold rounded-2xl press-effect disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Yuborilmoqda...
              </>
            ) : (
              "Bron so'rovi yuborish"
            )}
          </button>

          <p className="text-[10px] text-center text-gray-400">
            Bron admin tomonidan tasdiqlanadi
          </p>
        </form>
      </div>
    </div>
  );
}
