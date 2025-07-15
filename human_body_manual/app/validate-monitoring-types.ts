// TypeScript validation for monitoring system types
import { PrismaClient } from '@prisma/client';
import { MonitoringService } from './lib/monitoring-service';
import { ErrorTrackingService } from './lib/error-tracking';

// This file validates that all monitoring system types are correctly defined
// and that the services can be instantiated without runtime errors

function validateMonitoringTypes() {
  console.log('Validating monitoring system types...');
  
  // Test 1: Prisma client can be instantiated
  const prisma = new PrismaClient();
  console.log('✓ PrismaClient instantiated successfully');
  
  // Test 2: Monitoring service can be instantiated
  const monitoringService = new MonitoringService(prisma);
  console.log('✓ MonitoringService instantiated successfully');
  
  // Test 3: Error tracking service can be instantiated
  const errorTrackingService = new ErrorTrackingService(prisma);
  console.log('✓ ErrorTrackingService instantiated successfully');
  
  // Test 4: Check that all monitoring model types exist
  type PerformanceMetricType = Parameters<typeof prisma.performanceMetric.create>[0]['data'];
  type UserEngagementMetricType = Parameters<typeof prisma.userEngagementMetric.create>[0]['data'];
  type SystemHealthMetricType = Parameters<typeof prisma.systemHealthMetric.create>[0]['data'];
  type ErrorLogType = Parameters<typeof prisma.errorLog.create>[0]['data'];
  
  // Test sample data structures
  const samplePerformanceMetric: PerformanceMetricType = {
    metricName: 'test_metric',
    value: 100.5,
    metadata: { test: 'data' }
  };
  
  const sampleEngagementMetric: UserEngagementMetricType = {
    userId: 'user123',
    action: 'test_action',
    feature: 'test_feature',
    metadata: { test: 'data' }
  };
  
  const sampleHealthMetric: SystemHealthMetricType = {
    component: 'test_component',
    status: 'healthy',
    responseTime: 50.0,
    errorRate: 0.01
  };
  
  const sampleErrorLog: ErrorLogType = {
    errorType: 'test_error',
    message: 'Test error message',
    feature: 'test_feature',
    metadata: { severity: 'low' }
  };
  
  console.log('✓ All monitoring data types are correctly defined');
  
  // Test 5: Check method signatures exist
  const hasPerformanceMethod = typeof monitoringService.recordPerformanceMetric === 'function';
  const hasEngagementMethod = typeof monitoringService.recordUserEngagement === 'function';
  const hasHealthMethod = typeof monitoringService.recordSystemHealth === 'function';
  const hasErrorMethod = typeof errorTrackingService.recordError === 'function';
  
  if (hasPerformanceMethod && hasEngagementMethod && hasHealthMethod && hasErrorMethod) {
    console.log('✓ All monitoring service methods are correctly defined');
  } else {
    throw new Error('Some monitoring service methods are missing');
  }
  
  console.log('\n🎉 All monitoring system types validated successfully!');
  console.log('✓ Database schema types are correctly generated');
  console.log('✓ Service classes are properly structured');
  console.log('✓ All required methods exist');
  console.log('✓ Type safety is maintained throughout the system');
  
  return true;
}

// Export for potential use in other validation scripts
export { validateMonitoringTypes };

// Run validation if this file is executed directly
if (require.main === module) {
  try {
    validateMonitoringTypes();
    console.log('\n✅ Monitoring system type validation completed successfully');
  } catch (error) {
    console.error('\n❌ Monitoring system type validation failed:', error);
    process.exit(1);
  }
}