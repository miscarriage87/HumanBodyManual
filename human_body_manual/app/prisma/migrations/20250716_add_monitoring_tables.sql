-- CreateTable
CREATE TABLE "performance_metrics" (
    "id" TEXT NOT NULL,
    "metricName" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "performance_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_engagement_metrics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "feature" TEXT NOT NULL,
    "sessionId" TEXT,
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_engagement_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_health_metrics" (
    "id" TEXT NOT NULL,
    "component" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "responseTime" DOUBLE PRECISION,
    "errorRate" DOUBLE PRECISION,
    "details" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_health_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "error_logs" (
    "id" TEXT NOT NULL,
    "errorType" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "stackTrace" TEXT,
    "userId" TEXT,
    "feature" TEXT,
    "metadata" JSONB,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "error_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "performance_metrics_metricName_timestamp_idx" ON "performance_metrics"("metricName", "timestamp");

-- CreateIndex
CREATE INDEX "user_engagement_metrics_userId_feature_timestamp_idx" ON "user_engagement_metrics"("userId", "feature", "timestamp");

-- CreateIndex
CREATE INDEX "user_engagement_metrics_feature_action_timestamp_idx" ON "user_engagement_metrics"("feature", "action", "timestamp");

-- CreateIndex
CREATE INDEX "system_health_metrics_component_timestamp_idx" ON "system_health_metrics"("component", "timestamp");

-- CreateIndex
CREATE INDEX "system_health_metrics_status_timestamp_idx" ON "system_health_metrics"("status", "timestamp");

-- CreateIndex
CREATE INDEX "error_logs_errorType_timestamp_idx" ON "error_logs"("errorType", "timestamp");

-- CreateIndex
CREATE INDEX "error_logs_feature_timestamp_idx" ON "error_logs"("feature", "timestamp");

-- CreateIndex
CREATE INDEX "error_logs_resolved_timestamp_idx" ON "error_logs"("resolved", "timestamp");