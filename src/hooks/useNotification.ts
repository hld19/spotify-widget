/**
 * Notification Hook
 * Global notification system with customizable messages
 */

import { useState, useCallback } from 'react';

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

export function useNotification() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback((
    message: string, 
    type: Notification['type'] = 'info', 
    duration: number = 3000
  ) => {
    // Filter out all API error messages to reduce notification spam
    const ignoredErrors = [
      'Failed to fetch playback state',
      'Failed to play track',
      'Failed to pause',
      'Failed to skip',
      'Failed to change volume',
      'Failed to seek',
      'Failed to save track',
      'Failed to load',
      'Failed to refresh',
      'Failed to transfer',
      'Failed to add to queue',
      'Failed to change shuffle',
      'Failed to change repeat',
      'Rate limited',
      'No active device',
      'Login failed',
      'API error',
      'Network error',
      'Connection failed',
      'Request failed',
      'Spotify API error'
    ];
    
    if (type === 'error' && ignoredErrors.some(ignored => message.toLowerCase().includes(ignored.toLowerCase()))) {
      console.warn('🔇 Suppressed error notification:', message);
      return '';
    }

    const id = `${Date.now()}-${Math.random()}`;
    const notification: Notification = { id, message, type, duration };
    
    setNotifications(prev => [...prev, notification]);

    if (duration > 0) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    showNotification,
    removeNotification,
    clearAllNotifications
  };
} 