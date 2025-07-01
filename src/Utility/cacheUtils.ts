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

    console.log('All caches cleared successfully');
  } catch (error) {
    console.error('Error clearing caches:', error);
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
    // Clear caches on mobile devices
    clearAllCaches();
    
    // Check for construction messages
    if (checkForConstructionMessage()) {
      console.warn('Construction message detected, clearing caches...');
      clearAllCaches();
      setTimeout(() => {
        forceReload();
      }, 1000);
    }
  }
}; 