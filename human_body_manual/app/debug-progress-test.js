// Simple debug test to check ProgressTracker methods
const { ProgressTracker } = require('./dist/lib/progress-tracker.js');

console.log('ProgressTracker:', ProgressTracker);
console.log('ProgressTracker methods:', Object.getOwnPropertyNames(ProgressTracker));
console.log('recordCompletion:', ProgressTracker.recordCompletion);
console.log('getUserProgress:', ProgressTracker.getUserProgress);