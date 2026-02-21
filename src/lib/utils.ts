// Utility functions

/**
 * Generate time slots between opening and closing time
 */
export function generateTimeSlots(
  openingTime: string,
  closingTime: string,
  durationMinutes: number = 60
): { start: string; end: string }[] {
  const slots: { start: string; end: string }[] = [];
  const [openH, openM] = openingTime.split(":").map(Number);
  const [closeH, closeM] = closingTime.split(":").map(Number);

  let currentMinutes = openH * 60 + openM;
  let endMinutes = closeH * 60 + closeM;

  // If closing time is before opening time, it means past midnight (e.g. 16:00 - 02:00)
  if (endMinutes <= currentMinutes) {
    endMinutes += 24 * 60; // Add 24 hours
  }

  const formatTime = (totalMinutes: number): string => {
    const h = Math.floor(totalMinutes / 60) % 24;
    const m = totalMinutes % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  while (currentMinutes + durationMinutes <= endMinutes) {
    slots.push({
      start: formatTime(currentMinutes),
      end: formatTime(currentMinutes + durationMinutes),
    });

    currentMinutes += durationMinutes;
  }

  return slots;
}

/**
 * Check if two time ranges overlap
 */
export function isTimeOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const toMinutes = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  let s1 = toMinutes(start1);
  let e1 = toMinutes(end1);
  let s2 = toMinutes(start2);
  let e2 = toMinutes(end2);

  // Handle past-midnight (e.g. 23:00-01:00)
  if (e1 <= s1) e1 += 24 * 60;
  if (e2 <= s2) e2 += 24 * 60;

  return s1 < e2 && s2 < e1;
}

/**
 * Validate Uzbek phone number
 */
export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-\(\)]/g, "");
  return /^(\+998|998)?[0-9]{9}$/.test(cleaned);
}

/**
 * Format price in UZS
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("uz-UZ").format(price) + " so'm";
}

/**
 * Format time for display
 */
export function formatTimeRange(start: string, end: string): string {
  return `${start} — ${end}`;
}

/**
 * Get today's date in YYYY-MM-DD format (Tashkent timezone)
 */
export function getTodayDate(): string {
  const now = new Date();
  const tashkent = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Tashkent" })
  );
  return tashkent.toISOString().split("T")[0];
}

/**
 * Generate dates for the next N days
 */
export function getNextDays(count: number): { date: string; label: string; dayName: string }[] {
  const days: { date: string; label: string; dayName: string }[] = [];
  const dayNames = ["Yak", "Dush", "Sesh", "Chor", "Pay", "Jum", "Shan"];
  const monthNames = [
    "Yan", "Fev", "Mar", "Apr", "May", "Iyun",
    "Iyul", "Avg", "Sen", "Okt", "Noy", "Dek"
  ];

  for (let i = 0; i < count; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    const dayName = dayNames[d.getDay()];
    const label = `${d.getDate()} ${monthNames[d.getMonth()]}`;
    days.push({ date: dateStr, label, dayName });
  }

  return days;
}

/**
 * Status labels in Uzbek
 */
export const STATUS_LABELS: Record<string, string> = {
  pending: "Kutilmoqda",
  confirmed: "Tasdiqlandi",
  cancelled: "Bekor qilindi",
  blocked: "Bloklangan",
};

/**
 * Status colors (Tailwind class names)
 */
export const STATUS_COLORS: Record<string, string> = {
  free: "bg-slot-free",
  pending: "bg-slot-pending",
  confirmed: "bg-slot-booked",
  cancelled: "bg-gray-200",
  blocked: "bg-slot-blocked",
};
