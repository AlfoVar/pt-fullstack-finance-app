// import { PrismaClient } from "../generated/prisma";

import { PrismaClient } from "../generated/prisma";
import { PrismaPg } from '@prisma/adapter-pg';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// const prisma = new PrismaClient({
//   accelerateUrl: process.env.DATABASE_URL!,
// });
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = global.prisma ?? new PrismaClient({adapter});

if (process.env.NODE_ENV !== "production") global.prisma = prisma;

export default prisma;

