import type { ApplicationStats, ApplicationStatus } from '../types';
import type { CSSProperties } from 'react';

const STATUS_ORDER: ApplicationStatus[] = ['Applied', 'Interviewing', 'Offer', 'Rejected'];

interface PipelineAnalyticsProps {
  stats: ApplicationStats;
  loading: boolean;
}

function PipelineAnalytics({ stats, loading }: PipelineAnalyticsProps) {
  const maxCount = Math.max(1, ...STATUS_ORDER.map((status) => stats.counts[status] ?? 0));
  const interviewing = stats.counts.Interviewing ?? 0;
  const rejected = stats.counts.Rejected ?? 0;
  const active = (stats.counts.Applied ?? 0) + interviewing + (stats.counts.Offer ?? 0);
  const interviewRate = stats.total > 0 ? Math.round((interviewing / stats.total) * 100) : 0;

  return (
    <section className="analytics-grid" aria-label="Application analytics" aria-busy={loading}>
      <article className="metric-card">
        <span>Total</span>
        <strong>{stats.total}</strong>
        <small>Applications tracked</small>
      </article>
      <article className="metric-card">
        <span>Interviewing</span>
        <strong>{interviewing}</strong>
        <small>{interviewRate}% of pipeline</small>
      </article>
      <article className="metric-card">
        <span>Active</span>
        <strong>{active}</strong>
        <small>Applied, interviewing, or offer</small>
      </article>
      <article className="metric-card">
        <span>Rejected</span>
        <strong>{rejected}</strong>
        <small>Closed without offer</small>
      </article>

      <article className="chart-panel">
        <div className="chart-header">
          <div>
            <h2>Status breakdown</h2>
            <p>Counts update with search so you can inspect a company or role family.</p>
          </div>
        </div>
        <div className="bar-chart">
          {STATUS_ORDER.map((status) => {
            const count = stats.counts[status] ?? 0;
            const percentage = Math.max(8, Math.round((count / maxCount) * 100));
            const style = {
              height: `${percentage}%`,
              '--bar-width': `${percentage}%`,
            } as CSSProperties;

            return (
              <div className="bar-group" key={status}>
                <div className="bar-track" aria-hidden="true">
                  <div className={`bar-fill bar-${status.toLowerCase()}`} style={style} />
                </div>
                <strong>{count}</strong>
                <span>{status}</span>
              </div>
            );
          })}
        </div>
      </article>
    </section>
  );
}

export default PipelineAnalytics;
