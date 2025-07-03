// Network status monitoring utility
export class NetworkMonitor {
  private static instance: NetworkMonitor;
  private listeners: ((isOnline: boolean) => void)[] = [];

  private constructor() {
    this.setupEventListeners();
  }

  static getInstance(): NetworkMonitor {
    if (!NetworkMonitor.instance) {
      NetworkMonitor.instance = new NetworkMonitor();
    }
    return NetworkMonitor.instance;
  }

  private setupEventListeners() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.notifyListeners(true));
      window.addEventListener('offline', () => this.notifyListeners(false));
    }
  }

  addListener(callback: (isOnline: boolean) => void) {
    this.listeners.push(callback);
    // Immediately call with current status
    callback(navigator.onLine);
  }

  removeListener(callback: (isOnline: boolean) => void) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  private notifyListeners(isOnline: boolean) {
    this.listeners.forEach(listener => listener(isOnline));
  }

  isOnline(): boolean {
    return navigator.onLine;
  }
}

// Error message helper
export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') {
    return error;
  }

  if (error?.message) {
    return error.message;
  }

  if (error?.response?.status) {
    switch (error.response.status) {
      case 404:
        return 'Resource not found';
      case 500:
        return 'Server error - please try again later';
      case 503:
        return 'Service temporarily unavailable';
      default:
        return 'An error occurred while loading data';
    }
  }

  return 'An unexpected error occurred';
};

// Debounce utility for network requests
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}; 