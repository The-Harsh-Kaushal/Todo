"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { getApiErrorMessage } from "@/utils/apiError";

const ErrorPopupContext = createContext(null);

export function ErrorPopupProvider({ children }) {
  const [message, setMessage] = useState("");

  const showError = useCallback((nextMessage) => {
    if (!nextMessage) return;
    setMessage(nextMessage);
  }, []);

  const showApiError = useCallback((error, fallback) => {
    showError(getApiErrorMessage(error, fallback));
  }, [showError]);

  const closeError = useCallback(() => {
    setMessage("");
  }, []);

  const contextValue = useMemo(
    () => ({ showError, showApiError, closeError }),
    [showError, showApiError, closeError],
  );

  return (
    <ErrorPopupContext.Provider value={contextValue}>
      {children}
      {message && (
        <div className="fixed top-4 right-4 z-[9999] max-w-sm rounded-lg border border-red-700 bg-zinc-950 px-4 py-3 shadow-2xl">
          <div className="flex items-start gap-3">
            <p className="text-sm text-red-300">{message}</p>
            <button
              type="button"
              onClick={closeError}
              className="ml-auto text-xs font-semibold text-red-400 hover:text-red-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </ErrorPopupContext.Provider>
  );
}

export function useErrorPopup() {
  const context = useContext(ErrorPopupContext);
  if (!context) {
    throw new Error("useErrorPopup must be used within ErrorPopupProvider");
  }
  return context;
}
