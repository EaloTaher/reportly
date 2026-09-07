import { formatAmount, formatAmountPlain, toAmount } from "@/lib/currency"
import { formatVisitTime, splitIsoDate } from "@/lib/dates"
import type { Messages } from "@/i18n/messages"
import type { VisitWithCustomer } from "@/types/database"

const MIN_ROWS = 10
const PRINT_HOST_ID = "daily-report-print"

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
  const taken = visits.reduce((sum, visit) => sum + toAmount(visit.amount_taken), 0)
  const left = visits.reduce((sum, visit) => sum + toAmount(visit.amount_left), 0)
  const { year, month, day } = splitIsoDate(reportDate)

  const visitRows = visits.map((visit, index) => {
    const name = visit.customers?.full_name ?? t.visits.unknownCustomer
    const phone = visit.customers?.phone_number ?? ""
    const address = visit.customers?.address ?? ""
    const time = formatVisitTime(visit.visit_time) ?? ""
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

  const blankCount = Math.max(0, MIN_ROWS - visitRows.length)
  for (let i = 0; i < blankCount; i += 1) {
    visitRows.push(`<tr>
      <td class="num">${visits.length + i + 1}</td>
      <td></td><td></td><td></td><td></td><td class="money taken"></td>
      <td class="money left"></td><td></td><td></td>
    </tr>`)
  }

  const host = document.getElementById(PRINT_HOST_ID) ?? document.createElement("div")
  host.id = PRINT_HOST_ID
  host.setAttribute("dir", dir)
  host.innerHTML = `
<style>
  #daily-report-print .sheet { width: 100%; color: #12212a; font-family: "Segoe UI", Tahoma, "Noto Sans Arabic", "Geeza Pro", sans-serif; }
  #daily-report-print .banner {
    background: linear-gradient(90deg, #0b3d4a 0%, #156a7a 55%, #0b3d4a 100%);
    color: #fff;
    text-align: center;
    padding: 12px 16px;
    border-radius: 4px 4px 0 0;
    border-bottom: 4px solid #d4a017;
  }
  #daily-report-print .banner h1 { margin: 0; font-size: 20px; font-weight: 700; }
  #daily-report-print .meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    padding: 10px 12px;
    background: #eef6f7;
    border: 1px solid #9bb8be;
    border-top: 0;
    font-size: 13px;
  }
  #daily-report-print .rep { display: flex; align-items: center; gap: 8px; flex: 1; }
  #daily-report-print .rep .value {
    min-width: 180px;
    border-bottom: 1px solid #0b3d4a;
    padding: 2px 8px;
    font-weight: 700;
  }
  #daily-report-print .date-block { display: flex; align-items: center; gap: 8px; }
  #daily-report-print .date-boxes { display: flex; gap: 6px; }
  #daily-report-print .date-box {
    min-width: 54px;
    text-align: center;
    background: #fff;
    border: 1px solid #0b3d4a;
    border-radius: 4px;
    padding: 4px 6px;
  }
  #daily-report-print .date-box span { display: block; font-size: 10px; color: #5a737a; }
  #daily-report-print .date-box strong { font-size: 14px; font-variant-numeric: tabular-nums; }
  #daily-report-print table {
    width: 100%;
    border-collapse: collapse;
    font-size: 11px;
    table-layout: fixed;
  }
  #daily-report-print th, #daily-report-print td {
    border: 1px solid #8aa3aa;
    padding: 6px 5px;
    text-align: center;
    vertical-align: middle;
    word-wrap: break-word;
  }
  #daily-report-print thead th {
    background: #0b3d4a;
    color: #fff;
    font-weight: 700;
    font-size: 11px;
  }
  #daily-report-print thead { display: table-header-group; }
  #daily-report-print tfoot { display: table-footer-group; }
  #daily-report-print tbody tr:nth-child(even) td { background: #f3faf8; }
  #daily-report-print tbody tr:nth-child(odd) td { background: #fff; }
  #daily-report-print td.num { width: 28px; font-weight: 700; color: #0b3d4a; }
  #daily-report-print td.ltr { direction: ltr; unicode-bidi: isolate; }
  #daily-report-print td.money { font-variant-numeric: tabular-nums; font-weight: 600; }
  #daily-report-print td.taken { background: #e8f6ee !important; color: #146c43; }
  #daily-report-print td.left { background: #fff4e5 !important; color: #9a5b00; }
  #daily-report-print tbody tr:nth-child(even) td.taken { background: #d9f0e3 !important; }
  #daily-report-print tbody tr:nth-child(even) td.left { background: #ffe9cc !important; }
  #daily-report-print tfoot td {
    background: #0b3d4a;
    color: #fff;
    font-weight: 700;
    font-size: 12px;
  }
  #daily-report-print tfoot .money { color: #ffe08a; }
</style>
<div class="sheet">
  <div class="banner">
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
    <tbody>${visitRows.join("")}</tbody>
    <tfoot>
      <tr>
        <td colspan="5">${escapeHtml(t.today.visitCount)}: ${visits.length}</td>
        <td class="money">${escapeHtml(formatAmount(taken, currency))}</td>
        <td class="money">${escapeHtml(formatAmount(left, currency))}</td>
        <td colspan="2"></td>
      </tr>
    </tfoot>
  </table>
</div>`

  document.body.appendChild(host)
  window.setTimeout(() => {
    window.print()
  }, 50)
}
