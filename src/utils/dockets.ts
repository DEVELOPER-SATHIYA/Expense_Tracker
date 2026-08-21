export const BOOKING_CATEGORY_NAMES = [
  "booking",
  "ts booking",
  "nursery booking",
] as const;

export function normalizeCategoryName(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

export function isBookingCategory(name?: string | null) {
  if (!name) return false;
  return BOOKING_CATEGORY_NAMES.includes(
    normalizeCategoryName(name) as (typeof BOOKING_CATEGORY_NAMES)[number]
  );
}

export function parseDocketParts(raw: string) {
  const value = raw.trim().toUpperCase();
  const match = value.match(/^([A-Z]*)(\d+)$/);
  if (!match) return null;

  return {
    prefix: match[1],
    digits: match[2],
    number: BigInt(match[2]),
  };
}

export function normalizeDocketNumber(raw: string) {
  const parts = parseDocketParts(raw);
  if (!parts) return null;
  return `${parts.prefix}${parts.digits}`;
}

export function expandDocketRange(fromRaw: string, toRaw: string, max = 500) {
  const from = parseDocketParts(fromRaw);
  const to = parseDocketParts(toRaw);

  if (!from || !to) {
    throw new Error("Docket numbers must look like C1001785142.");
  }

  if (from.prefix !== to.prefix) {
    throw new Error("Range start and end must use the same prefix.");
  }

  const start = from.number <= to.number ? from.number : to.number;
  const end = from.number <= to.number ? to.number : from.number;
  const count = Number(end - start) + 1;

  if (count < 1) {
    throw new Error("Invalid docket range.");
  }

  if (count > max) {
    throw new Error(`Range is too large. Add at most ${max} dockets at a time.`);
  }

  const pad = Math.max(from.digits.length, to.digits.length);
  const numbers: string[] = [];

  for (let n = start; n <= end; n++) {
    numbers.push(from.prefix + n.toString().padStart(pad, "0"));
  }

  return numbers;
}

export function docketDateKey(docket: {
  updated_at: string;
  transactions?: { transaction_date: string; created_at: string } | null;
}) {
  if (docket.transactions?.transaction_date) {
    return docket.transactions.transaction_date.slice(0, 10);
  }
  const d = new Date(docket.updated_at);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function docketTimeLabel(docket: {
  updated_at: string;
  transactions?: { transaction_date: string; created_at: string } | null;
}) {
  const source = docket.transactions?.created_at || docket.updated_at;
  return new Date(source).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatDocketDateTime(docket: {
  updated_at: string;
  transactions?: { transaction_date: string; created_at: string } | null;
}) {
  return `${docketDateKey(docket)} ${docketTimeLabel(docket)}`;
}
