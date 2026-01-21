import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import { withRole } from "../../../lib/rbac";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;
  const userId = String(id);
  try {
    if (req.method === "GET") {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
      });
      if (!user) return res.status(404).json({ error: "Not found" });
      return res.status(200).json(user);
    }

    if (req.method === "PUT") {
      const { name, role, phone } = req.body;
      const updated = await prisma.user.update({
        where: { id: userId },
        data: {
          ...(name !== undefined && { name }),
          ...(role !== undefined && { role }),
          ...(phone !== undefined && { phone }),
        },
      });
      return res.status(200).json(updated);
    }

    if (req.method === "DELETE") {
      await prisma.user.delete({ where: { id: userId } });
      return res.status(204).end();
    }

    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: error.message ?? "Server error" });
  }
};

export default withRole(handler, ["ADMIN"]);