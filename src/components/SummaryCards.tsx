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
      color: 'bg-blue-950',
      lightColor: 'bg-blue-200',
      textColor: 'text-blue-950',
    },
    {
      label: 'Amount',
      value: `₹${totals.totalAmount.toLocaleString()}`,
      icon: '💰',
      color: 'bg-gray-950',
      lightColor: 'bg-gray-200',
      textColor: 'text-grey-950',
    },
    {
      label: 'Paid',
      value: `₹${totals.paidAmount.toLocaleString()}`,
      icon: '✅',
      color: 'bg-emerald-950',
      lightColor: 'bg-emerald-200',
      textColor: 'text-emerald-950',
    },
    {
      label: 'Pending',
      value: `₹${totals.pendingAmount.toLocaleString()}`,
      icon: '⏳',
      color: 'bg-orange-950',
      lightColor: 'bg-orange-200',
      textColor: 'text-orange-950',
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className={`${card.lightColor} rounded-md p-2 sm:p-4 border border-gray-100 shadow-sm`}
        >
          <div className="flex items-center gap-1 sm:gap-2 mb-1">
            <span className="text-xs sm:text-lg">{card.icon}</span>
            <span className={`text-[11px] sm:text-xs font-medium ${card.textColor}`}>
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
