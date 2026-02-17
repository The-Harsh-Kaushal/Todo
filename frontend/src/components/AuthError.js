"use client";

export default function AuthErrorModal({ message, onClose }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
      <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-md p-6 relative animate-fadeIn">

        <h2 className="text-xl font-semibold text-red-500 mb-3">
          Authentication Failed
        </h2>

        <p className="text-gray-700 mb-6">
          {message}
        </p>

        <button
          onClick={onClose}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}
