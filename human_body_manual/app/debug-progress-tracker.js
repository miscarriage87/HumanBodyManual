// Debug script to test ProgressTracker
const { ProgressTracker } = require('./lib/progress-tracker');

async function testProgressTracker() {
  try {
    console.log('Testing ProgressTracker...');
    
    const mockUserId = 'test-user-123';
    const mockExerciseData = {
      exerciseId: 'breathing-basics',
      bodyArea: 'nervensystem',
      durationMinutes: 15,
      difficultyLevel: 'Anfänger',
      sessionNotes: 'Great session!',
      mood: 'gut',
      energyLevel: 'hoch',
    };

    console.log('Calling recordCompletion...');
    const result = await ProgressTracker.recordCompletion(mockUserId, mockExerciseData);
    console.log('Result:', result);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testProgressTracker();