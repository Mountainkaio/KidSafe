-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" DATETIME,
    CONSTRAINT "Device_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Device" ("createdAt", "deviceToken", "id", "lastSeenAt", "lockScreen", "name", "pairingCode", "scheduleDays", "scheduleEnd", "scheduleStart", "scheduledBreaks", "status", "userId") SELECT "createdAt", "deviceToken", "id", "lastSeenAt", "lockScreen", "name", "pairingCode", "scheduleDays", "scheduleEnd", "scheduleStart", "scheduledBreaks", "status", "userId" FROM "Device";
DROP TABLE "Device";
ALTER TABLE "new_Device" RENAME TO "Device";
CREATE UNIQUE INDEX "Device_pairingCode_key" ON "Device"("pairingCode");
CREATE UNIQUE INDEX "Device_deviceToken_key" ON "Device"("deviceToken");
CREATE UNIQUE INDEX "Device_userId_key" ON "Device"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
