"use client";

import axios from "axios";
import React, { useEffect, useState } from "react";

export default function ProfilePage() {
  const [user, setUser] = useState(null);

  const [showResetForm, setShowResetForm] = useState(false);
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");

  const [loading, setLoading] = useState(false);
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
        console.log(err);
      }
    };

    fetchProfile();
  }, []);

  const handlePasswordReset = async () => {
    try {
      setLoading(true);
      setMessage("");
      setShowForgot(false);

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
        setShowResetForm(false);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setMessage("Wrong password.");
        setShowForgot(true);
      } else {
        setMessage("Something went wrong.");
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
      setMessage("Failed to send reset email.");
    } finally {
      setLoading(false);
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
              <input
                type="password"
                placeholder="Current Password"
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 focus:outline-none focus:border-indigo-500"
              />

              <input
                type="password"
                placeholder="New Password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 focus:outline-none focus:border-indigo-500"
              />

              <button
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
              onClick={handleForgotPassword}
              className="mt-3 text-sm text-indigo-400 hover:underline"
            >
              Forgot Password?
            </button>
          )}

          {/* Message */}
          {message && (
            <p className="mt-4 text-center text-sm text-zinc-400">{message}</p>
          )}
        </div>
      )}
    </div>
  );
}
