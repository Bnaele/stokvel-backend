import { PrismaClient } from '@prisma/client';
import { PrismaMssql } from '@prisma/adapter-mssql';
import * as dotenv from 'dotenv';

dotenv.config();

const adapter = new PrismaMssql({
  server: 'stokvel-server.database.windows.net',
  port: 1433,
  database: process.env.DB_NAME!,
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  options: {
    encrypt: true,
    trustServerCertificate: false,
  },
});

const prisma = new PrismaClient({ adapter });

export default prisma;
