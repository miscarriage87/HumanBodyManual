// Simple debug test to check if ProgressTracker methods exist
const { ProgressTracker } = require('./lib/progress-tracker');

console.log('ProgressTracker:', ProgressTracker);
console.log('ProgressTracker methods:', Object.getOwnPropertyNames(ProgressTracker));
console.log('recordCompletion:', typeof ProgressTracker.recordCompletion);
console.log('getUserProgress:', typeof ProgressTracker.getUserProgress);