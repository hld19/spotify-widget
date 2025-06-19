/**
 * Notification Container Component
 * Displays stacked notifications
 */

import { useTheme } from '../hooks/useTheme';
import { Notification } from '../hooks/useNotification';
import { 
  CheckCircleIcon, 
  ExclamationCircleIcon, 
  InformationCircleIcon, 
  XCircleIcon,
  XMarkIcon 
} from '@heroicons/react/24/solid';

interface NotificationContainerProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
}

export default function NotificationContainer({ notifications, onRemove }: NotificationContainerProps) {
  const { currentTheme } = useTheme();

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5" />;
      case 'error':
        return <XCircleIcon className="w-5 h-5" />;
      case 'warning':
        return <ExclamationCircleIcon className="w-5 h-5" />;
      case 'info':
      default:
        return <InformationCircleIcon className="w-5 h-5" />;
    }
  };

  const getColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return '#10b981'; // green
      case 'error':
        return '#ef4444'; // red
      case 'warning':
        return '#f59e0b'; // yellow
      case 'info':
      default:
        return currentTheme.primary;
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => {
        const color = getColor(notification.type);
        
        return (
          <div
            key={notification.id}
            className="flex items-center space-x-3 p-3 rounded-lg shadow-lg animate-slide-in max-w-sm"
            style={{
              backgroundColor: currentTheme.backgroundSecondary,
              borderLeft: `4px solid ${color}`,
            }}
          >
            <div style={{ color }}>{getIcon(notification.type)}</div>
            <p className="flex-1 text-sm" style={{ color: currentTheme.text }}>
              {notification.message}
            </p>
            <button
              onClick={() => onRemove(notification.id)}
              className="p-1 rounded hover:bg-opacity-10"
              style={{ color: currentTheme.textMuted }}
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
} 