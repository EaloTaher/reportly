import { formatAmountPlain } from "@/lib/currency"
import { formatVisitTimeLabel, splitIsoDate } from "@/lib/dates"
import type { Messages } from "@/i18n/messages"
import type { VisitWithCustomer } from "@/types/database"

const MIN_ROWS = 13
const ROW_HEIGHT = "10.4mm"
const PREVIEW_HOST_ID = "daily-report-print"

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}

function dash(value: string | null | undefined): string {
  const trimmed = value?.trim()
  return trimmed ? escapeHtml(trimmed) : ""
}

/* An installed app has no browser chrome, so a popup would trap the user with
   no way back. Those get the in-app overlay, which has its own close button. */
function isStandaloneApp(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

/* Fixed millimetre row heights keep the sheet full on A4 and on the US Letter
   paper iOS falls back to, where `@page size` is ignored. */
const sheetCss = `
  * { box-sizing: border-box; }
  html, body {
    margin: 0;
    padding: 0;
    background: #fff;
    color: #12212a;
    font-family: "Segoe UI", Tahoma, "Noto Sans Arabic", "Geeza Pro", sans-serif;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .bar {
    position: sticky;
    top: 0;
    z-index: 2;
    display: flex;
    gap: 8px;
    justify-content: center;
    padding: 10px 12px;
    padding-top: calc(10px + env(safe-area-inset-top));
    background: #0b3d4a;
  }
  .bar button {
    min-height: 44px;
    padding: 0 20px;
    border: 0;
    border-radius: 10px;
    font-size: 16px;
    font-weight: 700;
    background: #d4a017;
    color: #12212a;
  }
  .bar button.close {
    min-width: 44px;
    padding: 0;
    font-size: 20px;
    line-height: 1;
    background: #fff;
    color: #0b3d4a;
  }
  .sheet {
    width: 100%;
    padding: 4mm;
    background: #fff;
  }
  .banner {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    background: #0b3d4a;
    color: #fff;
    text-align: center;
    padding: 3mm 6mm;
    border-bottom: 3px solid #d4a017;
  }
  .banner img { height: 9mm; width: auto; object-fit: contain; }
  .banner h1 { margin: 0; font-size: 19px; font-weight: 700; }
  .meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    padding: 2.5mm 3mm;
    background: #eef6f7;
    border: 1px solid #9bb8be;
    border-top: 0;
    font-size: 13px;
  }
  .rep { display: flex; align-items: center; gap: 8px; flex: 1; }
  .rep .value {
    min-width: 45mm;
    border-bottom: 1px solid #0b3d4a;
    padding: 1mm 3mm;
    font-weight: 700;
  }
  .date-block { display: flex; align-items: center; gap: 8px; }
  .date-boxes { display: flex; gap: 5px; }
  .date-box {
    min-width: 14mm;
    text-align: center;
    background: #fff;
    border: 1px solid #0b3d4a;
    border-radius: 3px;
    padding: 1mm 2mm;
  }
  .date-box span { display: block; font-size: 10px; color: #5a737a; }
  .date-box strong { font-size: 14px; font-variant-numeric: tabular-nums; }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
    line-height: 1.2;
    table-layout: fixed;
  }
  col.c-num { width: 2.5%; }
  col.c-customer { width: 14%; }
  col.c-phone { width: 9%; }
  col.c-location { width: 15.5%; }
  col.c-arrival { width: 7%; }
  col.c-money { width: 9.5%; }
  col.c-objections { width: 10.5%; }
  col.c-notes { width: 22.5%; }
  th, td {
    border: 1px solid #8aa3aa;
    padding: 1mm 1.5mm;
    text-align: center;
    vertical-align: middle;
    word-wrap: break-word;
  }
  thead th { background: #0b3d4a; color: #fff; font-weight: 700; font-size: 12px; height: 9mm; }
  tbody tr { height: ${ROW_HEIGHT}; }
  tbody tr:nth-child(even) td { background: #f3faf8; }
  tbody tr:nth-child(odd) td { background: #fff; }
  td.num { padding: 1mm 0; font-weight: 700; color: #0b3d4a; }
  td.ltr { direction: ltr; unicode-bidi: isolate; }
  td.money { font-variant-numeric: tabular-nums; font-weight: 600; }
  td.taken { background: #e8f6ee !important; color: #146c43; }
  td.left { background: #fff4e5 !important; color: #9a5b00; }
  tbody tr:nth-child(even) td.taken { background: #d9f0e3 !important; }
  tbody tr:nth-child(even) td.left { background: #ffe9cc !important; }
  @page { size: A4 landscape; margin: 6mm; }
  @media print {
    .bar { display: none !important; }
    .sheet { padding: 0; }
    thead { display: table-header-group; }
    tr { break-inside: avoid; }
  }
`

export function printDailyReport(options: {
  header: string
  reportDate: string
  preparedBy?: string | null
  visits: VisitWithCustomer[]
  currency: string
  dir: "rtl" | "ltr"
  t: Messages
}) {
  const { header, reportDate, preparedBy, visits, currency, dir, t } = options
  const { year, month, day } = splitIsoDate(reportDate)
  const lang = dir === "rtl" ? "ar" : "en"
  const preview = isStandaloneApp() ? null : window.open("", "_blank")

  // Earliest visit first, untimed visits at the end.
  const ordered = [...visits].sort((a, b) => {
    if (!a.visit_time || !b.visit_time) {
      return Number(Boolean(b.visit_time)) - Number(Boolean(a.visit_time))
    }
    return a.visit_time.localeCompare(b.visit_time)
  })

  const rows = ordered.map((visit, index) => {
    const name = visit.customers?.full_name ?? t.visits.unknownCustomer
    const phone = visit.customers?.phone_number ?? ""
    const address = visit.customers?.address ?? ""
    const time = formatVisitTimeLabel(visit.visit_time) ?? ""
    return `<tr>
      <td class="num">${index + 1}</td>
      <td>${escapeHtml(name)}</td>
      <td class="ltr">${escapeHtml(phone)}</td>
      <td>${dash(address)}</td>
      <td class="ltr">${escapeHtml(time)}</td>
      <td class="money taken">${escapeHtml(formatAmountPlain(visit.amount_taken, currency))}</td>
      <td class="money left">${escapeHtml(formatAmountPlain(visit.amount_left, currency))}</td>
      <td>${dash(visit.status)}</td>
      <td>${dash(visit.notes)}</td>
    </tr>`
  })

  for (let i = rows.length; i < MIN_ROWS; i += 1) {
    rows.push(`<tr>
      <td class="num">${i + 1}</td>
      <td></td><td></td><td></td><td></td><td class="money taken"></td>
      <td class="money left"></td><td></td><td></td>
    </tr>`)
  }

  const logoSrc = new URL("/logo.png", window.location.origin).href
  const bar = `
  <div class="bar">
    <button type="button" onclick="window.print()">${escapeHtml(t.today.print)}</button>
    <button
      type="button"
      class="close"
      aria-label="${escapeHtml(t.today.closePreview)}"
      onclick="window.close(); setTimeout(function () { history.back() }, 150)"
    >&#10005;</button>
  </div>`
  const page = (toolbar: string) => `<!doctype html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>${escapeHtml(header)}</title>
  <style>${sheetCss}</style>
</head>
<body>${toolbar}
  <div class="sheet">
    <div class="banner">
      <img src="${escapeHtml(logoSrc)}" alt="" />
      <h1>${escapeHtml(header)}</h1>
    </div>
    <div class="meta">
      <div class="rep">
        <span>${escapeHtml(t.today.repName)}</span>
        <span class="value">${escapeHtml(preparedBy?.trim() || " ")}</span>
      </div>
      <div class="date-block">
        <span>${escapeHtml(t.today.date)}</span>
        <div class="date-boxes">
          <div class="date-box"><span>${escapeHtml(t.today.day)}</span><strong>${escapeHtml(day)}</strong></div>
          <div class="date-box"><span>${escapeHtml(t.today.month)}</span><strong>${escapeHtml(month)}</strong></div>
          <div class="date-box"><span>${escapeHtml(t.today.year)}</span><strong>${escapeHtml(year)}</strong></div>
        </div>
      </div>
    </div>
    <table>
      <colgroup>
        <col class="c-num" />
        <col class="c-customer" />
        <col class="c-phone" />
        <col class="c-location" />
        <col class="c-arrival" />
        <col class="c-money" />
        <col class="c-money" />
        <col class="c-objections" />
        <col class="c-notes" />
      </colgroup>
      <thead>
        <tr>
          <th>${escapeHtml(t.today.colNum)}</th>
          <th>${escapeHtml(t.today.colCustomer)}</th>
          <th>${escapeHtml(t.today.colPhone)}</th>
          <th>${escapeHtml(t.today.colLocation)}</th>
          <th>${escapeHtml(t.today.colArrival)}</th>
          <th>${escapeHtml(t.today.colCollections)} (${escapeHtml(currency)})</th>
          <th>${escapeHtml(t.today.colRemaining)} (${escapeHtml(currency)})</th>
          <th>${escapeHtml(t.today.colObjections)}</th>
          <th>${escapeHtml(t.visits.notes)}</th>
        </tr>
      </thead>
      <tbody>${rows.join("")}</tbody>
    </table>
  </div>
</body>
</html>`

  if (preview) {
    preview.document.open()
    preview.document.write(page(bar))
    preview.document.close()
    preview.focus()
    return
  }

  // Installed app: show the sheet in a full-screen frame with a way back out.
  document.getElementById(PREVIEW_HOST_ID)?.remove()
  const host = document.createElement("div")
  host.id = PREVIEW_HOST_ID
  host.setAttribute("dir", dir)
  host.innerHTML = `
    <div class="preview-bar">
      <button type="button" data-print>${escapeHtml(t.today.print)}</button>
      <button
        type="button"
        class="close"
        data-close
        aria-label="${escapeHtml(t.today.closePreview)}"
      >&#10005;</button>
    </div>
    <iframe title="${escapeHtml(header)}"></iframe>
  `
  document.body.appendChild(host)
  document.documentElement.classList.add("previewing-report")

  const frame = host.querySelector("iframe")
  if (frame instanceof HTMLIFrameElement) frame.srcdoc = page("")

  function closePreview() {
    document.documentElement.classList.remove("previewing-report")
    document.removeEventListener("keydown", onKeyDown)
    host.remove()
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape") closePreview()
  }

  host.querySelector("[data-print]")?.addEventListener("click", () => {
    frame?.contentWindow?.focus()
    frame?.contentWindow?.print()
  })
  host.querySelector("[data-close]")?.addEventListener("click", closePreview)
  document.addEventListener("keydown", onKeyDown)
}
