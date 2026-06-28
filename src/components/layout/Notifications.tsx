import { useEffect, useState } from 'react';
import notifSvg from '../../assets/icons/notification.svg';
import './Notifications.css';

interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
}

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: '1',
    title: 'Transfer completed',
    message: 'Your transfer of ₦100,000 to Access Bank was successful.',
    time: '2 min ago',
    unread: true,
  },
  {
    id: '2',
    title: 'Low balance alert',
    message: 'Your Kuda wallet balance is below ₦50,000.',
    time: '1 hour ago',
    unread: true,
  },
  {
    id: '3',
    title: 'Account linked',
    message: 'Your GTBank account ending in 4471 is now connected.',
    time: 'Yesterday',
    unread: true,
  },
];

export default function Notifications() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((item) => item.unread).length;

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [open]);

  function handleNotificationClick(id: string) {
    setNotifications((current) =>
      current.map((item) => (item.id === id ? { ...item, unread: false } : item)),
    );
  }

  return (
    <>
      <button
        type="button"
        className="notification-btn"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <span className="notif-icon">
          <img src={notifSvg} alt="" width="24" height="24" />
        </span>
        {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
      </button>

      <div
        className={`notif-drawer-root${open ? ' notif-drawer-root--open' : ''}`}
        aria-hidden={!open}
      >
        <button
          type="button"
          className="notif-drawer-backdrop"
          aria-label="Close notifications"
          onClick={() => setOpen(false)}
        />

        <aside
          className="notif-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Notifications"
        >
          <header className="notif-drawer-header">
            <h2>Notifications</h2>
            <button
              type="button"
              className="notif-drawer-close"
              aria-label="Close"
              onClick={() => setOpen(false)}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path
                  d="M5 5l10 10M15 5 5 15"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </header>

          <ul className="notif-drawer-list">
            {notifications.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={`notif-drawer-item${item.unread ? ' notif-drawer-item--unread' : ''}`}
                  onClick={() => handleNotificationClick(item.id)}
                >
                  <span className="notif-drawer-item-top">
                    <span className="notif-drawer-item-title">{item.title}</span>
                    <span className="notif-drawer-item-time">{item.time}</span>
                  </span>
                  <span className="notif-drawer-item-message">{item.message}</span>
                </button>
              </li>
            ))}
          </ul>

          {unreadCount === 0 && (
            <p className="notif-drawer-empty">You&apos;re all caught up.</p>
          )}
        </aside>
      </div>
    </>
  );
}