import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext";
import {
  fetchNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../../services/notificationService";

const formatTime = (value) =>
  new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

const NotificationBell = ({ buttonClassName = "" }) => {
  const location = useLocation();
  const { token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const buttonRef = useRef(null);
  const [panelStyle, setPanelStyle] = useState({ top: 0, left: 0 });
  const panelRef = useRef(null);

  const loadNotifications = async () => {
    if (!token) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetchNotifications(token, "?status=all&limit=6");
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      // Keep the bell non-blocking if the request fails.
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [token, location.pathname]);

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    const interval = window.setInterval(loadNotifications, 60000);
    return () => window.clearInterval(interval);
  }, [token]);

  const visibleNotifications = useMemo(
    () => notifications.slice(0, 5),
    [notifications],
  );

  const handleMarkAll = async () => {
    try {
      await markAllNotificationsAsRead(token);
      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          isRead: true,
        })),
      );
      setUnreadCount(0);
    } catch (error) {
      // Keep the panel usable even if marking fails.
    }
  };

  const handleMarkRead = async (notificationId) => {
    try {
      await markNotificationAsRead(token, notificationId);
      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification,
        ),
      );
      setUnreadCount((current) => Math.max(current - 1, 0));
    } catch (error) {
      // Keep the panel usable even if marking fails.
    }
  };

  const positionPanel = () => {
    const btn = buttonRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const width = Math.min(340, window.innerWidth - 24); // keep padding from viewport
    // Align right edge with button, clamp within viewport
    const desiredLeft = rect.right - width;
    const clampedLeft = Math.max(12, Math.min(desiredLeft, window.innerWidth - width - 12));
    const top = rect.bottom + 12;
    setPanelStyle({ top, left: clampedLeft });
  };

  useEffect(() => {
    if (!isOpen) return;
    positionPanel();
    const handle = () => positionPanel();
    window.addEventListener("resize", handle);
    window.addEventListener("scroll", handle, true);
    const handleClickOutside = (event) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("resize", handle);
      window.removeEventListener("scroll", handle, true);
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  return (
    <div className="relative isolate">
      <button
        type="button"
        ref={buttonRef}
        onClick={() => {
          setIsOpen((current) => !current);
          if (!isOpen) {
            setTimeout(positionPanel, 0);
          }
        }}
        className={[
          "relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10 hover:text-white",
          buttonClassName,
        ].join(" ")}
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="h-5 w-5 fill-none stroke-current stroke-[1.8]"
        >
          <path
            d="M6.5 9.5a5.5 5.5 0 1111 0v3.1c0 .7.2 1.4.6 2l1 1.5c.5.8-.1 1.9-1.1 1.9H6c-1 0-1.6-1.1-1.1-1.9l1-1.5c.4-.6.6-1.3.6-2V9.5z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10 19a2 2 0 004 0"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen
        ? createPortal(
            <div
              ref={panelRef}
              className="notification-panel fixed z-[60] max-h-[70vh] overflow-y-auto rounded-[20px] border border-white/12 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.14),transparent_40%),rgba(2,6,23,0.96)] p-4 pr-3 shadow-[0_20px_70px_rgba(0,0,0,0.35)] backdrop-blur-xl"
              style={{ ...panelStyle, width: "min(340px, calc(100vw - 24px))" }}
            >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.26em] text-slate-400">
                Notifications
              </p>
              <h3 className="mt-1.5 text-lg font-semibold text-white">
                Activity Center
              </h3>
            </div>
            <button
              type="button"
              onClick={handleMarkAll}
              className="rounded-xl border border-white/15 px-3 py-2 text-xs text-slate-200 transition hover:bg-white/10"
            >
              Mark all read
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {isLoading ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                Loading notifications...
              </div>
            ) : visibleNotifications.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                No notifications are available right now.
              </div>
            ) : (
              visibleNotifications.map((notification) => (
                <article
                  key={notification.id}
                  className={[
                    "rounded-[18px] border p-4 transition",
                    notification.isRead
                      ? "border-white/10 bg-white/5"
                      : "border-brand-400/25 bg-brand-500/10 shadow-inner shadow-brand-950/30",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white">
                        {notification.title}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        {notification.message}
                      </p>
                    </div>
                    {!notification.isRead ? (
                      <button
                        type="button"
                        onClick={() => handleMarkRead(notification.id)}
                        className="shrink-0 rounded-xl border border-white/10 px-3 py-2 text-[11px] text-slate-300 transition hover:bg-white/5"
                      >
                        Read
                      </button>
                    ) : null}
                  </div>
                  <p className="mt-3 text-xs text-slate-500">
                    {formatTime(notification.createdAt)}
                  </p>
                </article>
              ))
            )}
          </div>

          <Link
            to="/notifications"
            onClick={() => setIsOpen(false)}
            className="mt-4 inline-flex w-full items-center justify-center rounded-2xl border border-white/15 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Open Notification Center
          </Link>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
};

export default NotificationBell;
