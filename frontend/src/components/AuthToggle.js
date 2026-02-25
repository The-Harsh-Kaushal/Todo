

export default function AuthToggle({ active, setActive }) {
  return (
    <div className="relative flex w-85 bg-gray-100 p-1 rounded-full shadow-inner">
      <div
        className={`absolute top-1 bottom-1 w-1/2 rounded-full bg-white shadow-md transition-transform duration-300 ${active === "signup" ? "translate-x-0" : "translate-x-full"}`}
      />

      <button
        onClick={() => setActive("signup")}
        className={`relative z-10 w-1/2 py-2 text-sm font-semibold rounded-full transition ${active === "signup" ? "text-black" : "text-gray-500 hover:text-gray-700"}`}
      >
        Sign Up
      </button>

      <button
        onClick={() => setActive("login")}
        className={`relative z-10 w-1/2 py-2 text-sm font-semibold rounded-full transition ${active === "login" ? "text-black" : "text-gray-500 hover:text-gray-700"}`}
      >
        Log In
      </button>
    </div>
  );
}
