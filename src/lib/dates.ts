export function todayISODate(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export function formatReportDate(isoDate: string, locale = "ar-IQ"): string {
  const d = new Date(`${isoDate}T00:00:00`)
  return d.toLocaleDateString(locale, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    numberingSystem: "latn",
  })
}

export function splitIsoDate(isoDate: string): {
  year: string
  month: string
  day: string
} {
  const [year = "", month = "", day = ""] = isoDate.split("-")
  return { year, month, day }
}

/** 24-hour "HH:MM", the shape an `<input type="time">` expects. */
export function formatVisitTime(time: string | null | undefined): string | null {
  if (!time) return null
  return time.slice(0, 5)
}

/** Readable 12-hour label with Latin digits, e.g. "10:30 AM". */
export function formatVisitTimeLabel(
  time: string | null | undefined,
): string | null {
  const value = formatVisitTime(time)
  if (!value) return null
  const [hourPart = "", minute = "00"] = value.split(":")
  const hour = Number(hourPart)
  if (!Number.isInteger(hour)) return value
  const suffix = hour < 12 ? "AM" : "PM"
  return `${hour % 12 || 12}:${minute} ${suffix}`
}

export function isUniqueViolation(error: { code?: string } | null): boolean {
  return error?.code === "23505"
}
