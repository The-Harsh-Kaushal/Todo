"use client";

import Logo from "@/components/Logo";
import AuthToggle from "@/components/AuthToggle";
import AuthForm from "@/components/AuthForm";
import AuthErrorModal from "@/components/AuthError";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Home() {
  const [mode, setMode] = useState("signup");
  const [errorMessage, setErrorMessage] = useState(null);
  const router = useRouter();

  async function Authenticate(mode, formData) {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/auth/${mode}`,
        {
          name: formData?.name,
          email: formData?.email,
          password: formData?.password,
        },
        {
          withCredentials: true,
        },
      );
      localStorage.setItem("accesstoken", response.data.access);
      router.push("/dashboard");
    } catch (error) {
      const message = error.response?.data || "Server is down. Try again.";
      setErrorMessage(message);
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center px-6 pt-10">
      <div className="w-16 h-16 mb-8">
        <Logo />
      </div>

      <AuthToggle active={mode} setActive={setMode} />

      <div className="mt-8 w-full">
        <AuthForm authHandler={Authenticate} mode={mode} />
      </div>
      {errorMessage && (
        <AuthErrorModal
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      )}
    </div>
  );
}
