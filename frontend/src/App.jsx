import { useState, useEffect } from 'react';
import ApplicationList from './components/ApplicationList';

const API_URL = 'http://localhost:4000';

function App() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadApplications = () => {
    setLoading(true);
    fetch(`${API_URL}/applications`)
      .then((res) => res.json())
      .then((data) => {
        setApplications(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load applications. Is the backend server running?');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleView = (app) => {
    alert(`${app.company_name} — ${app.job_title}\n\nNotes: ${app.notes || '(none)'}`);
  };

  const handleEdit = (app) => {
    alert('Edit form coming in the next step!');
  };

  const handleDelete = async (app) => {
    const confirmed = window.confirm(`Delete the application for ${app.company_name}?`);
    if (!confirmed) return;

    try {
      const res = await fetch(`${API_URL}/applications/${app.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      loadApplications(); // refresh the list after deleting
    } catch (err) {
      console.error(err);
      alert('Failed to delete application.');
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px' }}>
      <h1>Job Application Tracker</h1>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && (
        <ApplicationList
          applications={applications}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

export default App;