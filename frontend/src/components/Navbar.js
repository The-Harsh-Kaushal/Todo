"use client";

import Logo from "@/components/Logo";
export default function Navbar() {
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
        {/* {isAuthPage &&  <button className="hover:text-white transition">
          Home
        </button>} */}

        {/* <button className="hover:text-white transition">
          About
        </button>

       { isAuthPage&& <button className="bg-linear-to-r from-indigo-500 to-purple-600 
                           text-white px-4 py-2 rounded-xl 
                           shadow-md hover:scale-105 active:scale-95 
                           transition-all duration-200">
          Logout
        </button>} */}
      </div>
    </nav>
  );
}
