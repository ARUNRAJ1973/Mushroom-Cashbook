interface TabsProps {
  activeTab: 'all' | 'paid' | 'pending';
  onTabChange: (tab: 'all' | 'paid' | 'pending') => void;
}

export function Tabs({ activeTab, onTabChange }: TabsProps) {
  const tabs = [
    { id: 'all', label: 'All', icon: '📋' },
    { id: 'paid', label: 'Paid', icon: '✅' },
    { id: 'pending', label: 'Pending', icon: '⏳' },
  ] as const;

  return (
    <div className="mb-4 sm:mb-6">
      <div className="bg-gray-200 p-1 rounded-xl flex gap-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          let activeBg = 'bg-white';
          let activeShadow = 'shadow-sm';
          let activeText = 'text-gray-900';
          
          // Different colors for different tabs
          if (tab.id === 'paid' && isActive) {
            activeBg = 'bg-green-800';
            activeText = 'text-white';
          } else if (tab.id === 'pending' && isActive) {
            activeBg = 'bg-red-800';
            activeText = 'text-white';
          } else if (tab.id === 'all' && isActive) {
            activeBg = 'bg-blue-800';
            activeText = 'text-white';
          }

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 px-3 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 ${
                isActive
                  ? `${activeBg} ${activeShadow} ${activeText} scale-[1.02]`
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <span className="text-xs sm:text-base">{tab.icon}</span>
              <span
              className={` ${
                isActive
                  ? `${activeText}`
                  : 'text-black'
              }`}
            
              >{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
