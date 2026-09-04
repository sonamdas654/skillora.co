import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Neon's free-tier compute suspends when idle and takes longer than Prisma's
// default 5s connect timeout to wake up, causing intermittent P1001 errors.
// Ensure sane timeouts on the connection string regardless of env config.
function withTimeouts(url: string | undefined) {
  if (!url) return url;
  try {
    const u = new URL(url);
    if (!u.searchParams.has("connect_timeout")) u.searchParams.set("connect_timeout", "15");
    if (!u.searchParams.has("pool_timeout")) u.searchParams.set("pool_timeout", "15");
    return u.toString();
  } catch {
    return url;
  }
}

interface MockCreatePayload {
  data?: Record<string, unknown>;
}

const noOp = {
  findMany: async () => [],
  findFirst: async () => null,
  findUnique: async () => null,
  create: async (d?: MockCreatePayload) => {
    const record = { id: "mock_" + Date.now(), createdAt: new Date(), ...(d?.data ?? {}) };
    return record;
  },
  update: async (d?: MockCreatePayload) => d?.data ?? {},
  delete: async () => ({}),
  count: async () => 0,
};

let prisma: PrismaClient;
try {
  if (process.env.DATABASE_URL) {
    prisma =
      globalForPrisma.prisma ??
      new PrismaClient({
        datasources: { db: { url: withTimeouts(process.env.DATABASE_URL) } },
      });
    if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
  } else {
    console.warn("[AI Studio] DATABASE_URL not set — using in-memory mock");
    prisma = new Proxy(
      {},
      {
        get: () =>
          new Proxy(noOp, {
            get: (target, prop: string) => {
              if (prop in target) return (target as Record<string, unknown>)[prop];
              return async () => ({});
            },
          }),
      }
    ) as unknown as PrismaClient;
  }
} catch {
  console.warn("[AI Studio] Database not connected — using mock");
  prisma = new Proxy(
    {},
    {
      get: () =>
        new Proxy(noOp, {
          get: (target, prop: string) => {
            if (prop in target) return (target as Record<string, unknown>)[prop];
            return async () => ({});
          },
        }),
    }
  ) as unknown as PrismaClient;
}

export { prisma };
