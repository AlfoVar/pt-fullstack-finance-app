import type { NextApiRequest, NextApiResponse } from "next";
import openapiSpec from "../../lib/openapiSpec";

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Content-Type", "application/json");
  res.status(200).json(openapiSpec);
}