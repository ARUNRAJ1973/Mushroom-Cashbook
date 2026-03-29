import type { Totals } from "../utils/calculateTotals";

interface SummaryCardsProps {
  totals: Totals;
}

export function SummaryCards({ totals }: SummaryCardsProps) {
  const cards = [
    {
      label: 'Packs',
      value: totals.totalPacks,
      icon: '📦',
      color: 'bg-blue-900',
      lightColor: 'bg-blue-200',
      textColor: 'text-blue-900',
    },
    {
      label: 'Amount',
      value: `₹${totals.totalAmount.toLocaleString()}`,
      icon: '💰',
      color: 'bg-gray-900',
      lightColor: 'bg-gray-200',
      textColor: 'text-grey-900',
    },
    {
      label: 'Paid',
      value: `₹${totals.paidAmount.toLocaleString()}`,
      icon: '✅',
      color: 'bg-emerald-500',
      lightColor: 'bg-emerald-200',
      textColor: 'text-emerald-900',
    },
    {
      label: 'Pending',
      value: `₹${totals.pendingAmount.toLocaleString()}`,
      icon: '⏳',
      color: 'bg-red-500',
      lightColor: 'bg-red-200',
      textColor: 'text-red-900',
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className={`${card.lightColor} rounded-xl p-2 sm:p-4 border border-gray-100 shadow-sm`}
        >
          <div className="flex items-center gap-1 sm:gap-2 mb-1">
            <span className="text-xs sm:text-lg">{card.icon}</span>
            <span className={`text-[9px] sm:text-xs font-medium ${card.textColor}`}>
              {card.label}
            </span>
          </div>
          {card.label == "Packs" ?
          <p className={`text-xs sm:text-lg font-bold text-center ${card.textColor}`}>
            {card.value}
          </p>
          :
          <p className={`text-xs sm:text-lg font-bold ${card.textColor}`}>
            {card.value}
          </p>
          }
        </div>  
      ))}
    </div>
  );
}
