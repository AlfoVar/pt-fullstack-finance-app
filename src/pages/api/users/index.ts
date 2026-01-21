import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import { withRole } from "../../../lib/rbac";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method === "GET") {
      const users = await prisma.user.findMany({
        select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      });
      return res.status(200).json(users);
    }

    if (req.method === "POST") {
      const { name, email, phone, role } = req.body;
      if (!name || !email) return res.status(400).json({ error: "Missing name or email" });
      const user = await prisma.user.create({
        data: { name, email, phone: phone ?? null, role: role ?? "ADMIN" },
      });
      return res.status(201).json(user);
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: error.message ?? "Server error" });
  }
}

export default withRole(handler, ["ADMIN"]);