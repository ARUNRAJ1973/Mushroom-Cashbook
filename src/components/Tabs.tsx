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
    <div className="flex gap-2 sm:gap-4 mb-4 sm:mb-6 border-b border-gray-200">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 sm:flex-none px-2 sm:px-6 py-2 sm:py-3 font-semibold text-xs sm:text-lg transition text-center ${
            activeTab === tab.id
              ? 'border-b-2 sm:border-b-4 border-[#2e823f] text-[#2e823f]'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <span className="mr-0.5 sm:mr-1 text-xs sm:text-base">{tab.icon}</span>
          <span className="text-sm font-bold text-gray-900 ms-1">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
