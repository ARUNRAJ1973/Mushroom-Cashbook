import type { Totals } from "../utils/calculateTotals";

interface SummaryCardsProps {
  totals: Totals;
}

export function   SummaryCards({ totals }: SummaryCardsProps) {
  const cards = [
    {
      label: 'Packs',
      value: totals.totalPacks,
      icon: '📦',
      color: 'bg-[#000]',
      lightColor: 'bg-[#EFF6FF]',
      textColor: 'text-[#000]',
    },
    {
      label: 'Amount',
      value: `₹${totals.totalAmount.toLocaleString()}`,
      icon: '💰',
      color: 'bg-[#000]',
      lightColor: 'bg-[#F5F3FF]',
      textColor: 'text-[#000]',
    },
    {
      label: 'Paid',
      value: `₹${totals.paidAmount.toLocaleString()}`,
      icon: '✅',
      color: 'bg-[#000]',
      lightColor: 'bg-[#ECFDF5]',
      textColor: 'text-[#000]',
    },
    {
      label: 'Pending',
      value: `₹${totals.pendingAmount.toLocaleString()}`,
      icon: '⏳',
      color: 'bg-[#000]',
      lightColor: 'bg-[#FFFBEB]',
      textColor: 'text-[#000]',
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6 ">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className={`${card.lightColor} rounded-md p-2 sm:p-4 border border-gray-100 shadow-[0_0_12px_rgba(0,0,0,0.2)] hover:shadow-[0_0_8px_rgba(0,0,0,0.5)]`}
        >
          <div className="flex items-center gap-1 sm:gap-2 mb-1">
            <span className="text-xs sm:text-lg">{card.icon}</span>
            <span className={`text-[11px] sm:text-xs font-medium ${card.textColor}`}>
              {card.label}
            </span>
          </div>
          {card.label == "Packs" ?
          <p className={`text-xs sm:text-lg font-bold ms-2 ${card.textColor}`}>
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
