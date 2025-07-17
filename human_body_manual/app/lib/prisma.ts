import { PrismaClient } from '@prisma/client';
import mockPrisma from './mock-prisma';

// Check if we should use mock database
const USE_MOCK_DB = process.env.USE_MOCK_DB === 'true' || process.env.NODE_ENV === 'development';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | typeof mockPrisma | undefined;
};

// Use mock in development, real client in production
export const prisma = USE_MOCK_DB 
  ? mockPrisma 
  : (globalForPrisma.prisma ?? new PrismaClient());

if (process.env.NODE_ENV !== 'production' && !USE_MOCK_DB) globalForPrisma.prisma = prisma;