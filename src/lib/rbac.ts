import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../pages/api/auth/[...nextauth]";

export async function getSession(req: NextApiRequest, res: NextApiResponse) {
  return await getServerSession(req, res, authOptions);
}

export function withRole(
  handler: NextApiHandler | ((req: NextApiRequest, res: NextApiResponse, session: any) => Promise<any>),
  allowedRoles?: string[]
): NextApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getSession(req, res);
    if (!session) return res.status(401).json({ error: "Unauthorized" });
    const role = session.user?.role ?? "USER";
    if (allowedRoles && !allowedRoles.includes(role)) return res.status(403).json({ error: "Forbidden" });
    if (handler.length >= 3) {
      return handler(req, res, session);
    }
    return handler(req, res);
  };
}