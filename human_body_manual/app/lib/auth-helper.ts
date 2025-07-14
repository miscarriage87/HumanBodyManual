import { NextRequest } from 'next/server';

// Temporary auth helper until NextAuth is properly configured
// In a real app, this would use NextAuth or your preferred auth solution

export interface User {
  id: string;
  email: string;
  name?: string;
}

export async function getCurrentUser(request: NextRequest): Promise<User | null> {
  try {
    // For development/testing, we'll use a header-based approach
    // In production, this should use proper JWT validation or session management
    
    const userId = request.headers.get('x-user-id');
    const userEmail = request.headers.get('x-user-email');
    const userName = request.headers.get('x-user-name');

    if (!userId || !userEmail) {
      return null;
    }

    return {
      id: userId,
      email: userEmail,
      name: userName || undefined,
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export async function requireAuth(request: NextRequest): Promise<User> {
  const user = await getCurrentUser(request);
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  return user;
}

// For testing purposes, create a demo user
export const DEMO_USER: User = {
  id: 'demo-user-123',
  email: 'demo@example.com',
  name: 'Demo User',
};

export function getDemoUser(): User {
  return DEMO_USER;
}