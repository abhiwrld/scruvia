/**
 * This special script handles the redirect to chat after authentication
 * It's placed directly in the auth directory to ensure it's immediately available
 */

// Function to forcefully redirect to chat
export function forceChatRedirect() {
  console.log('🚨 FORCE CHAT REDIRECT: Attempting to force redirect to /chat');
  
  try {
    // Clear any session storage items that might be causing issues
    sessionStorage.clear();
    
    // Set a flag to indicate we're forcing a redirect
    localStorage.setItem('force_redirect_attempted', 'true');
    localStorage.setItem('auth_successful', 'true');
    localStorage.setItem('force_redirect_time', Date.now().toString());
    
    // Log that we're doing this
    console.log('🚨 FORCE CHAT REDIRECT: About to hard redirect to /chat');
    
    // Use the most direct method to force a navigation
    window.location = '/chat';
    
    // As a fallback, also try replace
    setTimeout(() => {
      console.log('🚨 FORCE CHAT REDIRECT: Fallback redirect attempt');
      window.location.replace('/chat');
    }, 100);
    
    // As a final fallback, use href
    setTimeout(() => {
      console.log('🚨 FORCE CHAT REDIRECT: Last resort redirect attempt');
      window.location.href = '/chat';
    }, 200);
    
    return true;
  } catch (error) {
    console.error('Error during force redirect:', error);
    return false;
  }
}

// Function to check if we should automatically redirect
export function shouldAutoRedirect() {
  if (typeof window === 'undefined') return false;
  
  try {
    // If we're already on the chat page, don't redirect
    if (window.location.pathname.includes('/chat')) {
      return false;
    }
    
    // Check if user is authenticated
    const isAuthenticated = localStorage.getItem('authenticated') === 'true' && 
                           localStorage.getItem('user');
                           
    // If authenticated, return true to indicate we should redirect
    return isAuthenticated;
  } catch (error) {
    console.error('Error checking if should auto redirect:', error);
    return false;
  }
}
