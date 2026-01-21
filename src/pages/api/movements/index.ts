import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import { withRole } from "../../../lib/rbac";


const handler = async (req: NextApiRequest, res: NextApiResponse, session?: any) => {
  try {
    if (req.method === "GET") {
      const movements = await prisma.movement.findMany({
        orderBy: { date: "desc" },
        include: { user: { select: { id: true, name: true, email: true } } },
      });
      return res.status(200).json(movements);
    }

    if (req.method === "POST") {
      const { amount, concept, date, type, userId } = req.body;
      if (!amount || !concept || !date || !type || !userId) {
        return res.status(400).json({ error: "Missing fields" });
      }
      const movement = await prisma.movement.create({
        data: {
          amount: typeof amount === "string" || typeof amount === "number" ? amount : String(amount),
          concept,
          date: new Date(date),
          type,
          user: { connect: { id: userId } },
        },
      });
      return res.status(201).json(movement);
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
}

export default function wrapped(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    // POST -> require ADMIN
    return withRole(handler, ["ADMIN"])(req, res);
  }
  // GET -> require authenticated (any role)
  return withRole(handler)(req, res);
}

function PrismaDecimal(v: unknown) {
  return typeof v === "string" || typeof v === "number" ? v : String(v);
}