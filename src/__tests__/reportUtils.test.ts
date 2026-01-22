import { toNumber, computeBalance, generateCSV } from "../lib/reportUtils";

describe("reportUtils", () => {
  test("toNumber converts strings and numbers", () => {
    expect(toNumber("12.34")).toBeCloseTo(12.34);
    expect(toNumber(5)).toBe(5);
    expect(Number.isNaN(toNumber("foo"))).toBe(true);
  });

  test("computeBalance calculates balance with incomes and expenses", () => {
    const items = [
      { id: 1, amount: "100", type: "INCOME" as const },
      { id: 2, amount: 30, type: "EXPENSE" as const },
      { id: 3, amount: "20.5", type: "EXPENSE" as const },
    ];
    expect(computeBalance(items)).toBeCloseTo(49.5);
  });

  test("generateCSV produces CSV with header and escaped quotes", () => {
    const items = [
      { id: 1, amount: 10, type: "INCOME" as const, concept: 'Test "A"', date: "2026-01-01", userName: "User" },
    ];
    const csv = generateCSV(items);
    expect(csv.startsWith("id,concept,amount,type,date,user\n")).toBe(true);
    expect(csv).toContain('"Test ""A"""');
    expect(csv).toContain("10");
  });
});