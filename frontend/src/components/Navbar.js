"use client";

import Logo from "@/components/Logo";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/user/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
          },
        },
      );
    } catch (err) {
      console.log(err);
    }
    localStorage.removeItem("accesstoken");
    router.push("/");
  };

  return (
    <nav
      className="w-full px-5 py-4 flex items-center justify-between 
                 bg-black/60 backdrop-blur-xl 
                 border-b border-zinc-800"
    >
      {/* Left: Logo */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8">
          <Logo />
        </div>
        <span className="text-white font-semibold text-lg tracking-wide">
          Taskify
        </span>
      </div>

      {/* Right: Menu */}
      <div className="flex items-center gap-6 text-sm font-medium text-zinc-300">
        <Link href="/dashboard" className="hover:text-white transition">
          Dashboard
        </Link>

        <Link href="/profile" className="hover:text-white transition">
          Profile
        </Link>

        <button
          onClick={handleLogout}
          className="bg-linear-to-r from-indigo-500 to-purple-600 
                     text-white px-4 py-2 rounded-xl 
                     shadow-md hover:scale-105 active:scale-95 
                     transition-all duration-200"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
