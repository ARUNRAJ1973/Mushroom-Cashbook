import { useState, useEffect } from 'react';
import { isOnline, listenForConnectionChanges } from '../utils/pwa';

export function OfflineIndicator() {
  const [online, setOnline] = useState(isOnline());
  const [showReconnect, setShowReconnect] = useState(false);

  useEffect(() => {
    const cleanup = listenForConnectionChanges(
      () => {
        setOnline(true);
        setShowReconnect(true);
        // Hide reconnected message after 3 seconds
        setTimeout(() => setShowReconnect(false), 3000);
      },
      () => {
        setOnline(false);
        setShowReconnect(false);
      }
    );

    return cleanup;
  }, []);

  if (online && !showReconnect) return null;

  return (
    <div
      className={`fixed top-16 left-0 right-0 z-40 px-4 py-2 text-center text-sm font-medium transition-all duration-300 ${
        online
          ? 'bg-green-500 text-white'
          : 'bg-orange-500 text-white'
      }`}
    >
      <div className="flex items-center justify-center gap-2">
        {!online && (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.138m2.167 9.138l-2.829-2.829M21 21L3 3" />
            </svg>
            <span>You're offline. Some features may be limited.</span>
          </>
        )}
        {online && showReconnect && (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Back online!</span>
          </>
        )}
      </div>
    </div>
  );
}
