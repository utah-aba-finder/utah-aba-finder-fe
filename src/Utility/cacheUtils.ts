// Cache clearing utilities to prevent "under construction" issues on mobile

export const clearAllCaches = async (): Promise<void> => {
  try {
    // Clear browser caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }

    // Clear localStorage items that might cause issues
    const keysToRemove = [
      'lastVisit', 
      'dontShowAgain', 
      'hasVisited',
      'providerData',
      'userPreferences'
    ];
    
    keysToRemove.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
      }
    });

    // Clear sessionStorage
    sessionStorage.clear();

    
  } catch (error) {
    
  }
};

export const forceReload = (): void => {
  // Force a hard reload to bypass cache
  window.location.reload();
};

export const checkForConstructionMessage = (): boolean => {
  // Check if the page contains any "under construction" text
  const bodyText = document.body.innerText.toLowerCase();
  const constructionKeywords = [
    'under construction',
    'coming soon',
    'maintenance',
    'temporarily unavailable',
    'site maintenance'
  ];
  
  return constructionKeywords.some(keyword => bodyText.includes(keyword));
};

export const handleMobileIssues = (): void => {
  // Check if we're on mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (isMobile) {
    // Only run this once per browser session, not on every page load
    if (localStorage.getItem('mobileIssuesHandled')) {
      return;
    }
    
    // Set flag in localStorage (persists across page loads)
    localStorage.setItem('mobileIssuesHandled', 'true');
    
    
    // Only clear caches if we detect actual construction messages
    if (checkForConstructionMessage()) {
      clearAllCaches();
      
      // Only reload if absolutely necessary and not already attempted
      const reloadAttempted = localStorage.getItem('mobileReloadAttempted');
      if (!reloadAttempted) {
        localStorage.setItem('mobileReloadAttempted', 'true');
        setTimeout(() => {
          forceReload();
        }, 1000);
      } else {
      }
    } else {
    }
  }
}; 