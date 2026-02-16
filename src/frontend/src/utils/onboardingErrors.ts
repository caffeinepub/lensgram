/**
 * Normalizes and classifies onboarding-related errors into user-friendly messages
 */
export function classifyOnboardingError(error: unknown): {
  type: 'unauthorized' | 'username-taken' | 'generic';
  message: string;
} {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const lowerMessage = errorMessage.toLowerCase();

  // Check for authorization/session errors
  if (
    lowerMessage.includes('unauthorized') ||
    lowerMessage.includes('session') ||
    lowerMessage.includes('authentication') ||
    lowerMessage.includes('trap')
  ) {
    return {
      type: 'unauthorized',
      message: 'Your session expired. Please sign in again.',
    };
  }

  // Check for username taken error
  if (lowerMessage.includes('username taken')) {
    return {
      type: 'username-taken',
      message: 'This username is already taken. Please choose another one.',
    };
  }

  // Generic profile creation error
  return {
    type: 'generic',
    message: 'Failed to create profile. Please try again.',
  };
}
