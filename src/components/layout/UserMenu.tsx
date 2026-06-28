import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import profilePic from '../../assets/images/profile-pic.jpg';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { tearDownSession } from '../../lib/authFlow';
import { authService } from '../../services/authService';

export default function UserMenu() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  async function handleLogout() {
    setOpen(false);

    try {
      await authService.logout();
    } catch {
      // Session may already be expired — still clear local state.
    } finally {
      tearDownSession(dispatch);
      navigate('/login', { replace: true });
    }
  }

  return (
    <div className={`user-menu${open ? ' user-menu--open' : ''}`} ref={menuRef}>
      <div className="user-menu-trigger">
        <div className="profile-avatar">
          <img src={profilePic} alt="" height="30" width="30" />
        </div>
        <span className="profile-name">{user?.fullName ?? user?.email ?? 'Account'}</span>
        <button
          type="button"
          className="user-menu-toggle"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          aria-haspopup="menu"
          aria-label="Account menu"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path
              d="M2.5 4.5 6 8l3.5-3.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div className="user-menu-dropdown" role="menu">
        <Link
          to="/settings"
          className="user-menu-item"
          role="menuitem"
          onClick={() => setOpen(false)}
        >
          Profile
        </Link>
        <Link
          to="/settings"
          className="user-menu-item"
          role="menuitem"
          onClick={() => setOpen(false)}
        >
          Settings
        </Link>
        <button
          type="button"
          className="user-menu-item user-menu-item--danger"
          role="menuitem"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
}