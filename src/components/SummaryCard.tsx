interface SummaryCardProps {
  label: string;
  value: number;
  unit?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export function SummaryCard({ label, value, unit = '', variant = 'default' }: SummaryCardProps) {
  return (
    <div className={`summary-card summary-card--${variant}`}>
      <div className="summary-card__label">{label}</div>
      <div className="summary-card__value">
        {value.toLocaleString()} <span className="summary-card__unit">{unit}</span>
      </div>
    </div>
  );
}
