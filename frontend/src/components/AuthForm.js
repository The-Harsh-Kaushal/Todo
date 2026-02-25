"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { getApiErrorMessage } from "@/utils/apiError";
import { useErrorPopup } from "@/components/ErrorPopupProvider";

export default function AuthForm({ mode, authHandler }) {
  const { showApiError } = useErrorPopup();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const [message, setMessage] = useState("");

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    authHandler(mode, formData);
  }

  async function handleForgotPassword() {
    if (!formData.email) {
      setMessage("Please enter your email first.");
      return;
    }

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/user/forgetpassreq`,
        {
          email: formData.email,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
          },
        },
      );

      

      if (res.status == 200 || res.status == 204) {
        setMessage(res.data?.msg || "Password reset link sent to your email.");
      } else {
        setMessage("Something went wrong.");
      }
    } catch (error) {
      console.log(error);
      const msg = getApiErrorMessage(error, "Server error. Please try again.");
      setMessage(msg);
      showApiError(error, msg);
    }
  }

  return (
    <div className="w-full flex justify-center">
      <AnimatePresence mode="wait">
        <motion.form
          key={mode}
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.98 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className="w-100 bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-gray-100"
        >
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-gray-800">
              {mode === "signup" ? "Create your account" : "Welcome back"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {mode === "signup"
                ? "Start your journey with us"
                : "Login to continue"}
            </p>
          </div>

          <div className="flex flex-col gap-5">
            {mode === "signup" && (
              <motion.input
                layout
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            )}

            <motion.input
              layout
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />

            <div className="relative">
              <motion.input
                layout
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-16 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-indigo-600 hover:text-indigo-700"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {/* Forgot Password Link (Only in Login Mode) */}
            {mode === "login" && (
              <div className="text-right -mt-3">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-indigo-600 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="mt-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-xl font-semibold tracking-wide shadow-lg"
            >
              {mode === "signup" ? "Create Account" : "Log In"}
            </motion.button>

            {message && (
              <p className="text-sm text-center text-gray-600 mt-2">
                {message}
              </p>
            )}
          </div>
        </motion.form>
      </AnimatePresence>
    </div>
  );
}
