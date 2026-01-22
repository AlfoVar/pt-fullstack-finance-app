import { handler, PrismaDecimal } from "../../pages/api/movements/index";
import prisma from "../../lib/prisma";

describe("movements API (unit)", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("PrismaDecimal returns numbers/strings and stringifies others", () => {
    expect(PrismaDecimal(5)).toBe(5);
    expect(PrismaDecimal("12.3")).toBe("12.3");
    expect(PrismaDecimal(null)).toBe("null");
  });

  test("POST missing fields -> 400", async () => {
    const req: any = { method: "POST", body: { amount: "10" } }; // missing fields
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const res: any = { status };

    await handler(req, res, undefined);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ error: "Missing fields" });
  });

  test("POST with non-existent user -> 400 User not found", async () => {
    // mock prisma user lookup to return null
    (prisma.user.findUnique as jest.Mock | any) = jest.fn().mockResolvedValue(null);

    const req: any = {
      method: "POST",
      body: {
        amount: "10",
        concept: "Test",
        date: new Date().toISOString(),
        type: "INCOME",
      },
    };
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const res: any = { status };

    // pass a session with a user id so handler uses targetUserId from session
    const session = { user: { id: "non-existent-id" } };

    await handler(req, res, session);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: "non-existent-id" } });
    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ error: "User not found" });
  });
});