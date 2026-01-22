import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import type { Session } from "next-auth";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../pages/api/auth/[...nextauth]";

export async function getSession(req: NextApiRequest, res: NextApiResponse): Promise<Session | null> {
  return (await getServerSession(req, res, authOptions as any)) as Session | null;
}

export function withRole(
  handler: NextApiHandler | ((req: NextApiRequest, res: NextApiResponse, session: Session) => Promise<any>),
  allowedRoles?: string[]
): NextApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getSession(req, res);
    if (!session) return res.status(401).json({ error: "Unauthorized" });
    const role = session.user?.role ?? "USER";
    if (allowedRoles && !allowedRoles.includes(role)) return res.status(403).json({ error: "Forbidden" });
    if ((handler as any).length >= 3) {
      return (handler as any)(req, res, session);
    }
    return (handler as any)(req, res);
  };
}