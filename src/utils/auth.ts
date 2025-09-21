// Simple token storage utility
export const getStudentToken = async () => {
  try {
    // Check if we have Clerk available
    if (!(window as any).Clerk) {
      throw new Error('Clerk not available');
    }

    // Get Clerk user data
    const clerkUser = (window as any).Clerk.user;
    if (!clerkUser) {
      throw new Error('Not logged in to Clerk');
    }

    console.log('Creating token for user:', clerkUser.primaryEmailAddress?.emailAddress);

    // Create a simple token from Clerk user data
    const tokenData = {
      userId: clerkUser.id,
      email: clerkUser.primaryEmailAddress?.emailAddress,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      timestamp: Date.now()
    };

    // Store in sessionStorage for this session
    const token = btoa(JSON.stringify(tokenData));
    sessionStorage.setItem('studentToken', token);
    console.log('Token created successfully');
    return token;
  } catch (error) {
    console.error('Token generation failed:', error);
    throw error;
  }
};