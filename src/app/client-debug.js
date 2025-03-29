// Simple client-side debug helper that won't be exposed in the UI
export const debug = {
  log: (...args) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        // Keep a running log in localStorage
        const logs = JSON.parse(localStorage.getItem('__debug_logs') || '[]');
        const timestamp = new Date().toISOString();
        logs.push({
          timestamp,
          type: 'log',
          message: args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
          ).join(' ')
        });
        
        // Limit to last 100 logs
        if (logs.length > 100) {
          logs.shift();
        }
        
        localStorage.setItem('__debug_logs', JSON.stringify(logs));
      } catch (e) {
        console.error('Error in debug.log', e);
      }
    }
    
    // Always send to console in development
    console.log(...args);
  },
  
  error: (...args) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        // Keep a running log in localStorage
        const logs = JSON.parse(localStorage.getItem('__debug_logs') || '[]');
        const timestamp = new Date().toISOString();
        logs.push({
          timestamp,
          type: 'error',
          message: args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
          ).join(' ')
        });
        
        // Limit to last 100 logs
        if (logs.length > 100) {
          logs.shift();
        }
        
        localStorage.setItem('__debug_logs', JSON.stringify(logs));
      } catch (e) {
        console.error('Error in debug.error', e);
      }
    }
    
    // Always send to console in development
    console.error(...args);
  },
  
  getCapturedLogs: () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        return JSON.parse(localStorage.getItem('__debug_logs') || '[]');
      } catch (e) {
        console.error('Error getting debug logs', e);
        return [];
      }
    }
    return [];
  },
  
  clearLogs: () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('__debug_logs');
    }
  }
};

// Export a function to check auth state
export const checkAuthState = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    // Log current localStorage state
    const items = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !key.startsWith('__debug')) {
        try {
          items[key] = JSON.parse(localStorage.getItem(key));
        } catch {
          items[key] = localStorage.getItem(key);
        }
      }
    }
    
    // Check for auth cookie
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      if (key) acc[key] = value;
      return acc;
    }, {});
    
    // Log this info
    debug.log('Auth State Check', { localStorage: items, cookies });
    
    return { localStorage: items, cookies };
  } catch (e) {
    debug.error('Error in checkAuthState', e);
    return null;
  }
};
