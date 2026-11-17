-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BlockedSite" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'Geral',
    "deviceId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BlockedSite_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_BlockedSite" ("createdAt", "deviceId", "id", "url") SELECT "createdAt", "deviceId", "id", "url" FROM "BlockedSite";
DROP TABLE "BlockedSite";
ALTER TABLE "new_BlockedSite" RENAME TO "BlockedSite";
CREATE TABLE "new_Device" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL DEFAULT 'Dispositivo',
    "pairingCode" TEXT NOT NULL,
    "deviceToken" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "userId" INTEGER,
    "extensionEnabled" BOOLEAN NOT NULL DEFAULT true,
    "lockScreen" BOOLEAN NOT NULL DEFAULT false,
    "scheduleStart" TEXT,
    "scheduleEnd" TEXT,
    "scheduleDays" TEXT,
    "scheduledBreaks" BOOLEAN NOT NULL DEFAULT false,
    "breakUsageMinutes" INTEGER NOT NULL DEFAULT 15,
    "breakDurationMinutes" INTEGER NOT NULL DEFAULT 5,
    "customCategories" TEXT NOT NULL DEFAULT 'Geral',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" DATETIME,
    CONSTRAINT "Device_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Device" ("createdAt", "deviceToken", "extensionEnabled", "id", "lastSeenAt", "lockScreen", "name", "pairingCode", "scheduleDays", "scheduleEnd", "scheduleStart", "scheduledBreaks", "status", "userId") SELECT "createdAt", "deviceToken", "extensionEnabled", "id", "lastSeenAt", "lockScreen", "name", "pairingCode", "scheduleDays", "scheduleEnd", "scheduleStart", "scheduledBreaks", "status", "userId" FROM "Device";
DROP TABLE "Device";
ALTER TABLE "new_Device" RENAME TO "Device";
CREATE UNIQUE INDEX "Device_pairingCode_key" ON "Device"("pairingCode");
CREATE UNIQUE INDEX "Device_deviceToken_key" ON "Device"("deviceToken");
CREATE UNIQUE INDEX "Device_userId_key" ON "Device"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
