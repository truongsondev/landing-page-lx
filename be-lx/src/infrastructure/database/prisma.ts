import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

const parsedDatabaseUrl = new URL(databaseUrl);

const allowPublicKeyRetrievalParam = parsedDatabaseUrl.searchParams.get(
  "allowPublicKeyRetrieval"
);

const allowPublicKeyRetrieval =
  allowPublicKeyRetrievalParam === null
    ? true
    : allowPublicKeyRetrievalParam.toLowerCase() === "true";

const adapter = new PrismaMariaDb({
  host: parsedDatabaseUrl.hostname,
  port: parsedDatabaseUrl.port ? Number(parsedDatabaseUrl.port) : 3306,
  user: decodeURIComponent(parsedDatabaseUrl.username),
  password: decodeURIComponent(parsedDatabaseUrl.password),
  database: parsedDatabaseUrl.pathname.replace(/^\//, "") || undefined,
  allowPublicKeyRetrieval,
});

const prisma = new PrismaClient({
  adapter,
  log: ["query", "error", "warn"],
});

export default prisma;
