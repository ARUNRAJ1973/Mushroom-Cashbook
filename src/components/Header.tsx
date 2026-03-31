interface HeaderProps {
  onLogout?: () => void;
}

export function Header({ onLogout }: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-[#186338] via-[#186338] to-[#186338] text-white sticky top-0 z-40 shadow-lg">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl sm:text-3xl">🍄</span>
            <div>
              <h1 className="text-sm sm:text-2xl font-bold leading-tight">AR Organic Cashbook</h1>
              <p className="text-green-200 text-xs sm:text-sm ">Daily Sales Tracker</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
           <p className="hidden sm:block text-green-200 text-xs">Logout</p>
            {onLogout && (
              <button
                onClick={onLogout}
                className="p-2 hover:bg-white/10 rounded-lg transition"
                title="Logout"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
