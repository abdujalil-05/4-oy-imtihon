-- CreateEnum
CREATE TYPE "Roles" AS ENUM ('ADMIN', 'TEACHER', 'STUDENT');

-- CreateEnum
CREATE TYPE "RevokeReason" AS ENUM ('LOGOUT', 'LOGOUT_ALL', 'REVOKED_BY_USER', 'PASSWORD_CHANGED', 'LIMIT_EXCEEDED', 'REUSE_DETECTED', 'ADMIN_REVOKED');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "login" TEXT NOT NULL,
    "hashedPassword" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" "Roles" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "failedLoginCount" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Devices" (
    "deviceId" TEXT NOT NULL,
    "device" TEXT NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "hashedRefreshToken" TEXT NOT NULL,
    "previousTokenHash" TEXT,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "revokedReason" "RevokeReason",
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Devices_pkey" PRIMARY KEY ("deviceId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_login_key" ON "User"("login");

-- CreateIndex
CREATE UNIQUE INDEX "Devices_hashedRefreshToken_key" ON "Devices"("hashedRefreshToken");

-- CreateIndex
CREATE INDEX "Devices_previousTokenHash_idx" ON "Devices"("previousTokenHash");

-- CreateIndex
CREATE INDEX "Devices_userId_revokedAt_idx" ON "Devices"("userId", "revokedAt");

-- AddForeignKey
ALTER TABLE "Devices" ADD CONSTRAINT "Devices_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
