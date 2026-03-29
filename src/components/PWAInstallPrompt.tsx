import { useState, useEffect } from 'react';
import { listenForInstallPrompt, getInstallStatus, type BeforeInstallPromptEvent } from '../utils/pwa';

export function PWAInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [platform, setPlatform] = useState<string>('web');

  useEffect(() => {
    // Check if already installed
    const installStatus = getInstallStatus();
    setIsInstalled(installStatus.isInstalled);
    setPlatform(installStatus.platform);

    // Listen for install prompt
    listenForInstallPrompt((event) => {
      setInstallPrompt(event);
      // Show prompt after a delay
      setTimeout(() => setIsVisible(true), 3000);
    });

    // Check if app was installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setIsVisible(false);
      setInstallPrompt(null);
    });
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;

    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted install');
    }
    
    setInstallPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Store dismissal in localStorage to not show again for a while
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  };

  // Don't show if already installed or no prompt available
  if (isInstalled || (!installPrompt && platform !== 'ios')) return null;

  // Don't show if recently dismissed
  const dismissed = localStorage.getItem('pwa-prompt-dismissed');
  if (dismissed && Date.now() - parseInt(dismissed) < 7 * 24 * 60 * 60 * 1000) return null;

  // iOS specific instructions
  if (platform === 'ios' && !installPrompt) {
    return (
      <div className={`fixed bottom-20 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-50 transition-transform duration-300 ${isVisible ? 'translate-y-0' : 'translate-y-full opacity-0 pointer-events-none'}`}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#073011] to-[#2e823f] rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-xl">🍄</span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-sm">Install AR Cashbook</h3>
            <p className="text-xs text-gray-500 mt-1">
              Tap <span className="font-medium">Share</span> {'>'} <span className="font-medium">Add to Home Screen</span>
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-20 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-50 transition-transform duration-300 ${isVisible ? 'translate-y-0' : 'translate-y-full opacity-0 pointer-events-none'}`}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-[#073011] to-[#2e823f] rounded-xl flex items-center justify-center flex-shrink-0">
          <span className="text-xl">🍄</span>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-sm">Install AR Cashbook</h3>
          <p className="text-xs text-gray-500 mt-1">
            Install this app on your device for quick access offline
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleInstall}
              className="flex-1 bg-[#2e823f] hover:bg-[#236b33] text-white text-xs font-medium py-2 px-3 rounded-lg transition"
            >
              Install
            </button>
            <button
              onClick={handleDismiss}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium py-2 px-3 rounded-lg transition"
            >
              Later
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 p-1 -mr-1 -mt-1"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
