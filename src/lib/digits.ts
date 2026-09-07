/** Convert Eastern Arabic and Persian digits to ASCII 0–9. */
export function toAsciiDigits(value: string): string {
  return value.replace(/[\u0660-\u0669\u06F0-\u06F9]/g, (ch) => {
    const code = ch.charCodeAt(0)
    return String(code - (code < 0x06f0 ? 0x0660 : 0x06f0))
  })
}
