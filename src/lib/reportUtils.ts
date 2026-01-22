export type MovementMin = {
  id: number;
  amount: string | number;
  type: "INCOME" | "EXPENSE";
  concept?: string;
  date?: string;
  userName?: string | null;
};

export function toNumber(v: string | number): number {
  return typeof v === "number" ? v : Number(String(v));
}

export function computeBalance(items: MovementMin[]): number {
  return items.reduce((acc, m) => {
    const amt = toNumber(m.amount);
    return m.type === "INCOME" ? acc + amt : acc - amt;
  }, 0);
}

export function generateCSV(items: MovementMin[]): string {
  const hdr = ["id", "concept", "amount", "type", "date", "user"].join(",");
  const rows = items.map((m) =>
    [
      m.id,
      `"${(m.concept ?? "").replace(/"/g, '""')}"`,
      String(m.amount),
      m.type,
      m.date ?? "",
      `"${(m.userName ?? "").replace(/"/g, '""')}"`,
    ].join(",")
  );
  return `${hdr}\n${rows.join("\n")}`;
}