import { toAsciiDigits } from "@/lib/digits"

export function toAmount(value: number | string | null | undefined): number {
  const n = typeof value === "number" ? value : Number(value)
  return Number.isFinite(n) ? n : 0
}

export function formatAmount(
  amount: number | string | null | undefined,
  currency: string,
): string {
  const n = toAmount(amount)
  if (currency === "IQD") {
    return `${Math.round(n).toLocaleString("en-US")} IQD`
  }
  return `${n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`
}

export function formatAmountPlain(
  amount: number | string | null | undefined,
  currency: string,
): string {
  const n = toAmount(amount)
  if (currency === "IQD") {
    return Math.round(n).toLocaleString("en-US")
  }
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function storedToInputDigits(
  stored: number | string | null | undefined,
  currency: string,
): string {
  const n = toAmount(stored)
  if (n === 0) return ""
  if (currency === "IQD") {
    const digits = n / 1000
    return Number.isInteger(digits) ? String(digits) : String(digits)
  }
  return String(n)
}

export function inputDigitsToStored(digits: string, currency: string): number {
  const cleaned = toAsciiDigits(digits).trim().replace(/,/g, "")
  if (cleaned === "" || cleaned === ".") return 0
  const n = Number(cleaned)
  if (!Number.isFinite(n)) return 0
  if (currency === "IQD") return n * 1000
  return n
}
