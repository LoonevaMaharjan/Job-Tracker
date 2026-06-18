import type { ApplicationStats, ApplicationStatus } from '../types';
import type { CSSProperties } from 'react';

const STATUS_ORDER: ApplicationStatus[] = ['Applied', 'Interviewing', 'Offer', 'Rejected'];

interface PipelineAnalyticsProps {
  stats: ApplicationStats;
  loading: boolean;
}

function PipelineAnalytics({ stats, loading }: PipelineAnalyticsProps) {
  const maxCount = Math.max(1, ...STATUS_ORDER.map((status) => stats.counts[status] ?? 0));

  return (
    <section className="analytics-grid chart-only" aria-label="Application analytics" aria-busy={loading}>
      <article className="chart-panel">
        <div className="chart-header">
          <div>
            <h2>Status breakdown</h2>
            <p>{stats.total} applications across your current search.</p>
          </div>
          <span className="chart-total">{stats.total} total</span>
        </div>
        <div className="bar-chart">
          {STATUS_ORDER.map((status) => {
            const count = stats.counts[status] ?? 0;
            const percentage = Math.max(8, Math.round((count / maxCount) * 100));
            const share = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
            const style = {
              height: `${percentage}%`,
              '--bar-width': `${percentage}%`,
            } as CSSProperties;

            return (
              <div className="bar-group" key={status}>
                <div className="bar-track" aria-hidden="true">
                  <div className={`bar-fill bar-${status.toLowerCase()}`} style={style} />
                </div>
                <div className="bar-meta">
                  <strong>{count}</strong>
                  <span>{status}</span>
                  <small>{share}%</small>
                </div>
              </div>
            );
          })}
        </div>
      </article>
    </section>
  );
}

export default PipelineAnalytics;
