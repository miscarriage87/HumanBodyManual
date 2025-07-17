// Simple debug script to test ProgressTracker
const { ProgressTracker } = require('./lib/progress-tracker');

console.log('ProgressTracker:', ProgressTracker);
console.log('ProgressTracker methods:', Object.getOwnPropertyNames(ProgressTracker));

// Test if the class exists and has methods
if (ProgressTracker && typeof ProgressTracker.recordCompletion === 'function') {
  console.log('✅ ProgressTracker.recordCompletion exists');
} else {
  console.log('❌ ProgressTracker.recordCompletion missing');
}

if (ProgressTracker && typeof ProgressTracker.getUserProgress === 'function') {
  console.log('✅ ProgressTracker.getUserProgress exists');
} else {
  console.log('❌ ProgressTracker.getUserProgress missing');
}