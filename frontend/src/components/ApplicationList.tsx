import type { JobApplication } from '../types';

interface ApplicationListProps {
  applications: JobApplication[];
  onView: (application: JobApplication) => void;
  onEdit: (application: JobApplication) => void;
  onDelete: (application: JobApplication) => void;
}

function formatDate(value: string): string {
  return value ? value.slice(0, 10) : 'Not set';
}

function ApplicationList({ applications, onView, onEdit, onDelete }: ApplicationListProps) {
  if (applications.length === 0) {
    return <p className="empty-state">No applications match your filters.</p>;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Company</th>
            <th>Job Title</th>
            <th>Status</th>
            <th>Applied Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => (
            <tr key={app.id} className={app.optimistic ? 'is-pending' : undefined}>
              <td>{app.company_name}</td>
              <td>{app.job_title}</td>
              <td>
                <span className={`status status-${app.status.toLowerCase()}`}>{app.status}</span>
              </td>
              <td>{formatDate(app.applied_date)}</td>
              <td>
                <div className="row-actions">
                  <button type="button" onClick={() => onView(app)}>View</button>
                  <button type="button" onClick={() => onEdit(app)}>Edit</button>
                  <button type="button" className="danger" onClick={() => onDelete(app)}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ApplicationList;
