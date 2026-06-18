function ApplicationList({ applications, onView, onEdit, onDelete }) {
  if (applications.length === 0) {
    return <p>No applications found.</p>;
  }

  return (
    <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
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
          <tr key={app.id}>
            <td>{app.company_name}</td>
            <td>{app.job_title}</td>
            <td>{app.status}</td>
            <td>{app.applied_date}</td>
            <td>
              <button onClick={() => onView(app)}>View</button>{' '}
              <button onClick={() => onEdit(app)}>Edit</button>{' '}
              <button onClick={() => onDelete(app)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default ApplicationList;