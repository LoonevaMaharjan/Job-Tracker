import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import {
  createApplication,
  deleteApplication,
  listApplications,
  updateApplication,
} from './api';
import ApplicationList from './components/ApplicationList';
import ApplicationForm from './components/ApplicationForm';
import type { ApiMode, ApplicationInput, JobApplication, Pagination } from './types';
import './App.css';

const PAGE_SIZE = 5;
const EMPTY_PAGINATION: Pagination = { page: 1, limit: PAGE_SIZE, totalCount: 0, totalPages: 1 };

function App() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [pagination, setPagination] = useState<Pagination>(EMPTY_PAGINATION);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [apiMode, setApiMode] = useState<ApiMode>('rest');
  const [showForm, setShowForm] = useState(false);
  const [editingApp, setEditingApp] = useState<JobApplication | null>(null);
  const [viewingApp, setViewingApp] = useState<JobApplication | null>(null);

  const query = useMemo(
    () => ({ status: statusFilter, search: searchTerm, page, limit: PAGE_SIZE }),
    [page, searchTerm, statusFilter],
  );

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await listApplications(apiMode, query);
        if (!controller.signal.aborted) {
          setApplications(result.data);
          setPagination(result.pagination);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Failed to load applications.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, searchTerm ? 350 : 0);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [apiMode, query, searchTerm]);

  const refreshCurrentPage = async () => {
    const result = await listApplications(apiMode, query);
    setApplications(result.data);
    setPagination(result.pagination);
  };

  const handleFormSubmit = async (formData: ApplicationInput) => {
    setSaving(true);
    setError(null);
    setNotice(null);

    if (editingApp) {
      const previous = applications;
      const optimisticUpdate: JobApplication = { ...editingApp, ...formData, optimistic: true };
      setApplications((current) => current.map((app) => (app.id === editingApp.id ? optimisticUpdate : app)));

      try {
        const saved = await updateApplication(apiMode, editingApp.id, formData);
        setApplications((current) => current.map((app) => (app.id === saved.id ? saved : app)));
        setNotice('Application updated.');
        setShowForm(false);
        setEditingApp(null);
      } catch (err) {
        setApplications(previous);
        setError(err instanceof Error ? err.message : 'Failed to update application.');
      } finally {
        setSaving(false);
      }
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const optimisticCreate: JobApplication = { ...formData, id: tempId, notes: formData.notes || null, optimistic: true };
    setApplications((current) => [optimisticCreate, ...current].slice(0, PAGE_SIZE));

    try {
      const saved = await createApplication(apiMode, formData);
      setApplications((current) => current.map((app) => (app.id === tempId ? saved : app)));
      setPagination((current) => ({ ...current, totalCount: current.totalCount + 1 }));
      setNotice('Application added.');
      setShowForm(false);
    } catch (err) {
      setApplications((current) => current.filter((app) => app.id !== tempId));
      setError(err instanceof Error ? err.message : 'Failed to create application.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (app: JobApplication) => {
    const confirmed = window.confirm(`Delete the application for ${app.company_name}?`);
    if (!confirmed) return;

    const previous = applications;
    setApplications((current) => current.filter((item) => item.id !== app.id));
    setPagination((current) => ({ ...current, totalCount: Math.max(0, current.totalCount - 1) }));
    setError(null);
    setNotice('Application deleted.');

    try {
      await deleteApplication(apiMode, app.id);
      await refreshCurrentPage();
    } catch (err) {
      setApplications(previous);
      setPagination((current) => ({ ...current, totalCount: current.totalCount + 1 }));
      setError(err instanceof Error ? err.message : 'Failed to delete application.');
      setNotice(null);
    }
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(event.target.value);
    setPage(1);
  };

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <h1>Job Application Tracker</h1>
          <p>Track roles, move candidates through stages, and search your pipeline.</p>
        </div>
        <button type="button" onClick={() => { setEditingApp(null); setShowForm(true); }}>
          Add Application
        </button>
      </header>

      <section className="toolbar" aria-label="Filters">
        <label>
          Search
          <input
            type="search"
            placeholder="Company or job title"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </label>

        <label>
          Status
          <select value={statusFilter} onChange={handleStatusChange}>
            <option value="All">All</option>
            <option value="Applied">Applied</option>
            <option value="Interviewing">Interviewing</option>
            <option value="Offer">Offer</option>
            <option value="Rejected">Rejected</option>
          </select>
        </label>

        <label>
          API
          <select value={apiMode} onChange={(event) => setApiMode(event.target.value as ApiMode)}>
            <option value="rest">REST</option>
            <option value="graphql">GraphQL</option>
          </select>
        </label>
      </section>

      {showForm && (
        <section className="form-panel">
          <h2>{editingApp ? 'Edit Application' : 'Add Application'}</h2>
          <ApplicationForm
            key={editingApp?.id ?? 'new'}
            initialData={editingApp}
            saving={saving}
            onSubmit={handleFormSubmit}
            onCancel={() => { setShowForm(false); setEditingApp(null); }}
          />
        </section>
      )}

      {viewingApp && (
        <section className="detail-panel">
          <div>
            <h2>{viewingApp.company_name}</h2>
            <p>{viewingApp.job_title} · {viewingApp.status}</p>
            <p>{viewingApp.notes || 'No notes yet.'}</p>
          </div>
          <button type="button" className="secondary" onClick={() => setViewingApp(null)}>Close</button>
        </section>
      )}

      {loading && <div className="message loading">Loading applications...</div>}
      {error && <div className="message error" role="alert">{error}</div>}
      {notice && !error && <div className="message success">{notice}</div>}

      {!loading && !error && (
        <>
          <ApplicationList
            applications={applications}
            onView={setViewingApp}
            onEdit={(app) => { setEditingApp(app); setShowForm(true); }}
            onDelete={handleDelete}
          />

          <nav className="pagination" aria-label="Pagination">
            <button type="button" className="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </button>
            <span>
              Page {pagination.page} of {pagination.totalPages} · {pagination.totalCount} total
            </span>
            <button
              type="button"
              className="secondary"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </nav>
        </>
      )}
    </main>
  );
}

export default App;
