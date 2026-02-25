"use client";

import { BellIcon } from "@heroicons/react/24/solid";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useErrorPopup } from "@/components/ErrorPopupProvider";
import Logo from "@/components/Logo";
import NotificationPopUp from "./NotificationPopUp";

export default function Navbar() {
  const router = useRouter();
  const { showApiError } = useErrorPopup();
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const notifRef = useRef(null);
  const LIMIT = 15;

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications],
  );

  const getAuthHeaders = useCallback(() => {
    if (typeof window === "undefined") return {};
    return {
      Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
    };
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/user/logout`,
        {},
        {
          headers: getAuthHeaders(),
        },
      );
    } catch (err) {
      showApiError(err, "Logout failed.");
    }
    localStorage.removeItem("accesstoken");
    router.push("/");
  };

  const fetchNotifications = useCallback(
    async ({ reset = false, offset = 0 } = {}) => {
      const finalOffset = reset ? 0 : offset;
      const setLoader = reset ? setLoading : setLoadingMore;

      try {
        setLoader(true);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/user/notifications`,
          {
            headers: getAuthHeaders(),
            params: {
              offset: finalOffset,
              limit: LIMIT,
              notSeen: unread,
            },
          },
        );

        const nextNotifications = response.data.notifications || [];
        if (reset) {
          setNotifications(nextNotifications);
        } else {
          setNotifications((prev) => {
            const existingIds = new Set(prev.map((item) => item._id));
            const deduped = nextNotifications.filter(
              (item) => !existingIds.has(item._id),
            );
            return [...prev, ...deduped];
          });
        }

        setHasMore(nextNotifications.length >= LIMIT);
      } catch (err) {
        showApiError(err, "Failed to load notifications.");
      } finally {
        setLoader(false);
      }
    },
    [unread, showApiError, getAuthHeaders],
  );

  const markNotificationAsRead = async (notificationId) => {
    const target = notifications.find((item) => item._id === notificationId);
    if (!target || target.read) return;

    setNotifications((prev) =>
      prev.map((item) =>
        item._id === notificationId ? { ...item, read: true } : item,
      ),
    );

    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/user/readnotification/${notificationId}`,
        {},
        {
          headers: getAuthHeaders(),
        },
      );
    } catch (err) {
      setNotifications((prev) =>
        prev.map((item) =>
          item._id === notificationId ? { ...item, read: false } : item,
        ),
      );
      showApiError(err, "Failed to mark notification as read.");
    }
  };

  const handleScroll = () => {
    const container = notifRef.current;
    if (!container || loadingMore || loading || !hasMore) return;

    const nearBottom =
      container.scrollTop + container.clientHeight >=
      container.scrollHeight - 8;
    if (nearBottom) {
      fetchNotifications({ offset: notifications.length });
    }
  };

  useEffect(() => {
    if (!showNotif) return;
    fetchNotifications({ reset: true });
  }, [showNotif, fetchNotifications]);

  return (
    <nav className="w-full px-5 py-4 flex items-center justify-between bg-black/60 backdrop-blur-xl border-b border-zinc-800">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8">
          <Logo />
        </div>
        <span className="text-white font-semibold text-lg tracking-wide">
          Taskify
        </span>
      </div>

      <div className="flex items-center gap-6 text-sm font-medium text-zinc-300">
        <div className="relative">
          <button
            type="button"
            className="relative p-1 text-zinc-300 transition hover:text-white"
            onClick={() => setShowNotif((prev) => !prev)}
          >
            <BellIcon className="h-5 w-5 cursor-pointer" />
            {unreadCount > 0 && (
              <span className="absolute -right-2 -top-2 min-w-5 rounded-full bg-red-500 px-1.5 text-[10px] font-semibold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {showNotif && (
            <div className="absolute right-0 mt-3 w-96 rounded-xl border border-zinc-800 bg-zinc-950/95 p-3 shadow-2xl backdrop-blur-lg">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold tracking-wide text-white">
                  Notification Center
                </h2>
                <button
                  type="button"
                  className="rounded-md border border-zinc-800 px-2 py-1 text-[11px] text-zinc-300 transition hover:border-zinc-600 hover:text-white"
                  onClick={() => setUnread((prev) => !prev)}
                >
                  {unread ? "Show all" : "Unread only"}
                </button>
              </div>

              <div
                ref={notifRef}
                onScroll={handleScroll}
                className="max-h-96 space-y-2 overflow-y-auto custom-scroll pr-1"
              >
                {loading && (
                  <p className="py-5 text-center text-xs text-zinc-500">
                    Loading notifications...
                  </p>
                )}

                {!loading && notifications.length === 0 && (
                  <p className="py-6 text-center text-xs text-zinc-500">
                    No notifications found.
                  </p>
                )}

                {!loading &&
                  notifications.map((item) => (
                    <NotificationPopUp
                      key={item._id}
                      id={item._id}
                      title={item.title}
                      message={item.message}
                      createdAt={item.createdAt}
                      read={item.read}
                      onOpen={markNotificationAsRead}
                    />
                  ))}

                {loadingMore && (
                  <p className="pb-3 pt-2 text-center text-xs text-zinc-500">
                    Loading more...
                  </p>
                )}

                {!loading && !hasMore && notifications.length > 0 && (
                  <p className="pb-3 pt-2 text-center text-[11px] text-zinc-600">
                    You are all caught up.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <Link href="/dashboard" className="hover:text-white transition">
          Dashboard
        </Link>
        <Link href="/profile" className="hover:text-white transition">
          Profile
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="bg-linear-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-xl shadow-md hover:scale-105 active:scale-95 transition-all duration-200"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
