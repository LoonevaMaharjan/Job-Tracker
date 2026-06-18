import { useState, useEffect } from 'react';
import ApplicationList from './components/ApplicationList';
import ApplicationForm from './components/ApplicationForm';

const API_URL = 'http://localhost:4000';

function App() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');

  const [showForm, setShowForm] = useState(false);
  const [editingApp, setEditingApp] = useState(null);

  const loadApplications = (filter = statusFilter) => {
    setLoading(true);
    const url = filter === 'All'
      ? `${API_URL}/applications`
      : `${API_URL}/applications?status=${filter}`;

    fetch(url)
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

  const handleFilterChange = (e) => {
    const newFilter = e.target.value;
    setStatusFilter(newFilter);
    loadApplications(newFilter);
  };

  const handleView = (app) => {
    alert(`${app.company_name} — ${app.job_title}\n\nNotes: ${app.notes || '(none)'}`);
  };

  const handleAddClick = () => {
    setEditingApp(null);
    setShowForm(true);
  };

  const handleEditClick = (app) => {
    setEditingApp(app);
    setShowForm(true);
  };

  const handleDelete = async (app) => {
    const confirmed = window.confirm(`Delete the application for ${app.company_name}?`);
    if (!confirmed) return;

    try {
      const res = await fetch(`${API_URL}/applications/${app.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      loadApplications();
    } catch (err) {
      console.error(err);
      alert('Failed to delete application.');
    }
  };

  const handleFormSubmit = async (formData) => {
    const isEditing = editingApp !== null;
    const url = isEditing ? `${API_URL}/applications/${editingApp.id}` : `${API_URL}/applications`;
    const method = isEditing ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errData = await res.json();
        console.error(errData);
        alert('Failed to save application. Check the console for details.');
        return;
      }

      setShowForm(false);
      setEditingApp(null);
      loadApplications();
    } catch (err) {
      console.error(err);
      alert('Failed to save application.');
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingApp(null);
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px' }}>
      <h1>Job Application Tracker</h1>

      <div style={{ marginBottom: '16px' }}>
        <label>
          Filter by status:{' '}
          <select value={statusFilter} onChange={handleFilterChange}>
            <option value="All">All</option>
            <option value="Applied">Applied</option>
            <option value="Interviewing">Interviewing</option>
            <option value="Offer">Offer</option>
            <option value="Rejected">Rejected</option>
          </select>
        </label>
      </div>

      {!showForm && (
        <button onClick={handleAddClick} style={{ marginBottom: '16px' }}>
          + Add Application
        </button>
      )}

      {showForm && (
        <div style={{ marginBottom: '24px', border: '1px solid #ccc', padding: '16px' }}>
          <h2>{editingApp ? 'Edit Application' : 'Add Application'}</h2>
          <ApplicationForm
            initialData={editingApp}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        </div>
      )}

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && (
        <ApplicationList
          applications={applications}
          onView={handleView}
          onEdit={handleEditClick}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

export default App;