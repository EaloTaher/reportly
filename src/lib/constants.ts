export const STATUS_OPTIONS = [
  "لا يوجد",
  "السوق ضعيف",
  "لم يستلم مواد",
] as const

export type VisitStatus = (typeof STATUS_OPTIONS)[number]

export const DEFAULT_STATUS: VisitStatus = "لا يوجد"

export const NOTES_QUICK_FILL = "لا يوجد"

export const CURRENCY_OPTIONS = ["IQD", "USD", "EUR"] as const

export type CurrencyCode = (typeof CURRENCY_OPTIONS)[number]
