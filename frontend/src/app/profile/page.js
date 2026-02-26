"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useErrorPopup } from "@/components/ErrorPopupProvider";
import { getApiErrorMessage } from "@/utils/apiError";

export default function ProfilePage() {
  const { showApiError } = useErrorPopup();
  const router = useRouter();
  const [user, setUser] = useState(null);

  const [showResetForm, setShowResetForm] = useState(false);
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [showDeleteForm, setShowDeleteForm] = useState(false);
  const [deletePass, setDeletePass] = useState("");
  const [showDeletePass, setShowDeletePass] = useState(false);

  const [loading, setLoading] = useState(false);
  const [deletingProfile, setDeletingProfile] = useState(false);
  const [message, setMessage] = useState("");
  const [showForgot, setShowForgot] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/user/profile`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
            },
          },
        );
        setUser(res.data.user);
      } catch (err) {
        showApiError(err, "Failed to load profile.");
      }
    };

    fetchProfile();
  }, [showApiError]);

  const handlePasswordReset = async () => {
    try {
      setLoading(true);
      setMessage("");
      setShowForgot(false);
      if (!currentPass || !newPass || !confirmPass) {
        setMessage("fill all the fields");
        return;
      }
      if (newPass !== confirmPass) {
        setMessage("password doesn't match ");
        return;
      }

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/user/resetpassword`,
        { currentPass, newPass },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
          },
        },
      );

      if (res.status === 200) {
        setMessage("Password updated successfully.");
        setCurrentPass("");
        setNewPass("");
        setConfirmPass("");
        setShowResetForm(false);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        const msg = getApiErrorMessage(err, "Wrong password.");
        setMessage(msg);
        setShowForgot(true);
        showApiError(err, msg);
      } else {
        const msg = getApiErrorMessage(err, "Something went wrong.");
        setMessage(msg);
        showApiError(err, msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    try {
      setLoading(true);
      setMessage("");

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/user/forgetpassreq`,
        {
          email: localStorage.getItem("user"),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
          },
        },
      );

      if (res.status === 200) {
        setMessage("Reset password email sent.");
      }
    } catch (err) {
      const msg = getApiErrorMessage(err, "Failed to send reset email.");
      setMessage(msg);
      showApiError(err, msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProfile = async () => {
    if (!deletePass) {
      setMessage("Password is required to delete profile.");
      return;
    }

    try {
      setDeletingProfile(true);
      setMessage("");
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BASE_URL}/user/deleteprofile`,
        {
          data: { password: deletePass },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
          },
        },
      );

      localStorage.removeItem("accesstoken");
      localStorage.removeItem("user");
      router.push("/");
    } catch (err) {
      const msg = getApiErrorMessage(err, "Failed to delete profile.");
      setMessage(msg);
      showApiError(err, msg);
    } finally {
      setDeletingProfile(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      {user && (
        <div
          className="w-full max-w-md p-8 rounded-2xl 
                        bg-zinc-900/70 backdrop-blur-xl 
                        border border-zinc-800 
                        shadow-2xl text-white"
        >
          {/* Avatar */}
          <div className="flex flex-col items-center mb-6">
            <div
              className="w-20 h-20 rounded-full 
                            bg-gradient-to-r from-indigo-500 to-purple-600 
                            flex items-center justify-center 
                            text-2xl font-bold shadow-lg"
            >
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <h2 className="mt-4 text-2xl font-semibold">{user.name}</h2>
            <p className="text-zinc-400 text-sm">{user.email}</p>
          </div>

          {/* User ID */}
          <div className="border-t border-zinc-800 pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-500">User ID</span>
              <span className="text-zinc-300">{user.id}</span>
            </div>
          </div>

          {/* Toggle Reset Form */}
          {!showResetForm && (
            <button
              type="button"
              onClick={() => {
                setShowResetForm(true);
                setMessage("");
              }}
              className="mt-6 w-full 
                         bg-gradient-to-r from-indigo-500 to-purple-600 
                         py-2 rounded-xl font-medium 
                         hover:scale-[1.02] active:scale-95 
                         transition-all duration-200"
            >
              Reset Password
            </button>
          )}

          {/* Reset Form */}
          {showResetForm && (
            <div className="mt-6 space-y-4">
              <div className="relative">
                <input
                  type={showCurrentPass ? "text" : "password"}
                  placeholder="Current Password"
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  className="w-full px-3 py-2 pr-16 rounded-lg bg-zinc-800 border border-zinc-700 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-indigo-400 hover:text-indigo-300"
                >
                  {showCurrentPass ? "Hide" : "Show"}
                </button>
              </div>
              {/* newpass */}
              <div className="relative">
                <input
                  type={showNewPass ? "text" : "password"}
                  placeholder="New Password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="w-full px-3 py-2 pr-16 rounded-lg bg-zinc-800 border border-zinc-700 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-indigo-400 hover:text-indigo-300"
                >
                  {showNewPass ? "Hide" : "Show"}
                </button>
              </div>
              {/* confirm new pass */}
              <div className="relative">
                <input
                  type={showConfirmPass ? "text" : "password"}
                  placeholder="Confirm New Password"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  className="w-full px-3 py-2 pr-16 rounded-lg bg-zinc-800 border border-zinc-700 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-indigo-400 hover:text-indigo-300"
                >
                  {showConfirmPass ? "Hide" : "Show"}
                </button>
              </div>

              <button
                type="button"
                onClick={handlePasswordReset}
                disabled={loading}
                className="w-full bg-indigo-600 py-2 rounded-xl hover:bg-indigo-700 transition"
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </div>
          )}

          {/* Forgot Password Button (only on 401) */}
          {showForgot && (
            <button
              type="button"
              onClick={handleForgotPassword}
              className="mt-3 text-sm text-indigo-400 hover:underline"
            >
              Forgot Password?
            </button>
          )}

          {/* Delete profile */}
          <div className="mt-6 border-t border-red-900/70 pt-4">
            {!showDeleteForm && (
              <button
                type="button"
                onClick={() => {
                  setShowDeleteForm(true);
                  setMessage("");
                }}
                className="w-full border border-red-700 text-red-400 py-2 rounded-xl hover:bg-red-950/50 transition"
              >
                Delete Profile
              </button>
            )}

            {showDeleteForm && (
              <div className="mt-3 space-y-3">
                <p className="text-xs text-red-300">
                  This action is permanent. Enter your password to continue.
                </p>
                <div className="relative">
                  <input
                    type={showDeletePass ? "text" : "password"}
                    placeholder="Confirm account password"
                    value={deletePass}
                    onChange={(e) => setDeletePass(e.target.value)}
                    className="w-full px-3 py-2 pr-16 rounded-lg bg-zinc-800 border border-zinc-700 focus:outline-none focus:border-red-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowDeletePass((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-red-300 hover:text-red-200"
                  >
                    {showDeletePass ? "Hide" : "Show"}
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeleteForm(false);
                      setDeletePass("");
                    }}
                    className="flex-1 border border-zinc-700 py-2 rounded-xl text-zinc-300 hover:bg-zinc-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteProfile}
                    disabled={deletingProfile}
                    className="flex-1 bg-red-600 py-2 rounded-xl hover:bg-red-700 transition text-white disabled:opacity-70"
                  >
                    {deletingProfile ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Message */}
          {message && (
            <p className="mt-4 text-center text-sm text-zinc-400">{message}</p>
          )}
        </div>
      )}
    </div>
  );
}
