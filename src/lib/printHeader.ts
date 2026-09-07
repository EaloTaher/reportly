const STORAGE_KEY = "reportly.printHeader"

export function getPrintHeader(): string {
  try {
    return localStorage.getItem(STORAGE_KEY)?.trim() ?? ""
  } catch {
    return ""
  }
}

export function setPrintHeader(value: string) {
  localStorage.setItem(STORAGE_KEY, value.trim())
}
