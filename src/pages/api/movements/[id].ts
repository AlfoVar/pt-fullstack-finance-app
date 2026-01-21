import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import { withRole } from "../../../lib/rbac";

async function handler(req: NextApiRequest, res: NextApiResponse, session?: any) {
  const { id } = req.query;
  const movementId = Number(id);
  if (Number.isNaN(movementId)) return res.status(400).json({ error: "Invalid id" });

  try {
    if (req.method === "GET") {
      const movement = await prisma.movement.findUnique({
        where: { id: movementId },
        include: { user: { select: { id: true, name: true, email: true } } },
      });
      if (!movement) return res.status(404).json({ error: "Not found" });
      return res.status(200).json(movement);
    }

    if (req.method === "PUT") {
      const { amount, concept, date, type } = req.body;
      const updated = await prisma.movement.update({
        where: { id: movementId },
        data: {
          ...(amount !== undefined && { amount: PrismaDecimal(amount) }),
          ...(concept !== undefined && { concept }),
          ...(date !== undefined && { date: new Date(date) }),
          ...(type !== undefined && { type }),
        },
      });
      return res.status(200).json(updated);
    }

    if (req.method === "DELETE") {
      await prisma.movement.delete({ where: { id: movementId } });
      return res.status(204).end();
    }

    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
}

function PrismaDecimal(v: unknown) {
  return typeof v === "string" || typeof v === "number" ? v : String(v);
}

export default function wrapped(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    return withRole(handler)(req, res);
  }
  return withRole(handler, ["ADMIN"])(req, res);
}