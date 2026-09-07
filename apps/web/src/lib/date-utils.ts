/**
 * Utilitários puros para manipulação e formatação de datas sem dependências externas.
 */

export function parseIsoDateOnly(dateStr: string): { year: number; month: number; day: number } {
  const cleanStr = dateStr.slice(0, 10);
  const [yearStr, monthStr, dayStr] = cleanStr.split('-');
  return {
    year: parseInt(yearStr, 10),
    month: parseInt(monthStr, 10),
    day: parseInt(dayStr, 10),
  };
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const { year, month, day } = parseIsoDateOnly(dateStr);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(day)}/${pad(month)}/${year}`;
}

export function formatDateRange(startStr: string, endStr: string): string {
  return `${formatDate(startStr)} a ${formatDate(endStr)}`;
}

export function calculateEndDate(startDateStr: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDateStr)) {
    return '';
  }

  const { year, month, day } = parseIsoDateOnly(startDateStr);
  // Usa Date UTC para evitar divergência de timezone de verão/inverno
  const startUtc = new Date(Date.UTC(year, month - 1, day));
  const endUtc = new Date(startUtc.getTime() + 6 * 24 * 60 * 60 * 1000);

  const endYear = endUtc.getUTCFullYear();
  const endMonth = String(endUtc.getUTCMonth() + 1).padStart(2, '0');
  const endDay = String(endUtc.getUTCDate()).padStart(2, '0');

  return `${endYear}-${endMonth}-${endDay}`;
}

export function getSuggestedStartDate(fromDate: Date = new Date()): string {
  const dayOfWeek = fromDate.getDay(); // 0 = Domingo, 1 = Segunda, ...
  const diffToMonday = dayOfWeek === 1 ? 0 : dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
  const targetDate = new Date(fromDate.getTime() + diffToMonday * 24 * 60 * 60 * 1000);

  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  const day = String(targetDate.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
