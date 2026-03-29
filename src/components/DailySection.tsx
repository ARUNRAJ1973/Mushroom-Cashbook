import type { DailySummary } from "../types";


interface DailySectionProps {
  dailySummary: DailySummary;
}

export function DailySection({ dailySummary }: DailySectionProps) {
  const date = new Date(dailySummary.date);
  const formattedDate = date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });

  return (
    <div className="daily-section">
      <div className="daily-section__header">
        <h3 className="daily-section__date">{formattedDate}</h3>
      </div>

      <div className="daily-section__entries">
        {dailySummary.entries.map((entry) => (
          <div key={entry.id} className="entry">
            <div className="entry__info">
              <div className="entry__customer">{entry.customer}</div>
              <div className="entry__description">{entry.description}</div>
              <div className="entry__meta">
                <span className="entry__packs">{entry.packs} packs</span>
                {entry.time && <span className="entry__time">{entry.time}</span>}
                <span className={`entry__status entry__status--${entry.status}`}>
                  {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                </span>
              </div>
            </div>
            <div className="entry__amount">₹{entry.amount.toLocaleString()}</div>
          </div>
        ))}
      </div>

      <div className="daily-section__footer">
        <div className="daily-footer">
          <div className="daily-footer__item">
            <span className="daily-footer__label">Total Packs:</span>
            <span className="daily-footer__value">{dailySummary.totalPacks}</span>
          </div>
          <div className="daily-footer__item">
            <span className="daily-footer__label">Total Amount:</span>
            <span className="daily-footer__value">₹{dailySummary.totalAmount.toLocaleString()}</span>
          </div>
          <div className="daily-footer__item">
            <span className="daily-footer__label">Paid:</span>
            <span className="daily-footer__value daily-footer__value--paid">₹{dailySummary.paidAmount.toLocaleString()}</span>
          </div>
          <div className="daily-footer__item">
            <span className="daily-footer__label">Pendingsqq:</span>
            <span className="daily-footer__value daily-footer__value--pending">₹{dailySummary.pendingAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
