import { useState, useEffect } from 'react';
import { Network } from '@capacitor/network';
import { Capacitor } from '@capacitor/core';

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Only use Network API on native platforms
    if (!Capacitor.isNativePlatform()) {
      // Fallback to browser's navigator.onLine
      setIsOnline(navigator.onLine);

      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }

    // Native platform - use Capacitor Network API
    const checkStatus = async () => {
      try {
        const status = await Network.getStatus();
        setIsOnline(status.connected);
      } catch (error) {
        console.error('Failed to check network status:', error);
        setIsOnline(true); // Assume online on error
      }
    };

    checkStatus();

    let listenerHandle: any;

    Network.addListener('networkStatusChange', status => {
      setIsOnline(status.connected);
    }).then(handle => {
      listenerHandle = handle;
    });

    return () => {
      if (listenerHandle) {
        listenerHandle.remove();
      }
    };
  }, []);

  return isOnline;
};
