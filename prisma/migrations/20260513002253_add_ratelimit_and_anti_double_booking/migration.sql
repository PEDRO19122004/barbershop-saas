-- CreateTable
CREATE TABLE "RateLimit" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RateLimit_key_createdAt_idx" ON "RateLimit"("key", "createdAt");
-- Anti double-booking: dois agendamentos ATIVOS nao podem
-- ter o mesmo barbeiro no mesmo horario de inicio.
CREATE UNIQUE INDEX "Appointment_barberId_startTime_active_unique"
ON "Appointment" ("barberId", "startTime")
WHERE status IN ('PENDING', 'CONFIRMED');