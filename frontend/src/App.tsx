import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import {
  createApplication,
  deleteApplication,
  getApplicationStats,
  listApplications,
  updateApplication,
} from './api';
import ApplicationList from './components/ApplicationList';
import ApplicationForm from './components/ApplicationForm';
import PipelineAnalytics from './components/PipelineAnalytics';
import type { ApiMode, ApplicationInput, ApplicationStats, JobApplication, Pagination } from './types';
import './App.css';

const PAGE_SIZE = 5;
const API_MODE: ApiMode = 'rest';
const EMPTY_PAGINATION: Pagination = { page: 1, limit: PAGE_SIZE, totalCount: 0, totalPages: 1 };
const EMPTY_STATS: ApplicationStats = {
  total: 0,
  counts: { Applied: 0, Interviewing: 0, Offer: 0, Rejected: 0 },
};

function App() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [pagination, setPagination] = useState<Pagination>(EMPTY_PAGINATION);
  const [stats, setStats] = useState<ApplicationStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [reloadToken, setReloadToken] = useState(0);
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
        const result = await listApplications(API_MODE, query);
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
  }, [query, reloadToken, searchTerm]);

  useEffect(() => {
    getApplicationStats(API_MODE, '')
      .then(setStats)
      .catch(() => setStats(EMPTY_STATS));
  }, [reloadToken]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;

      if (showForm) {
        setShowForm(false);
        setEditingApp(null);
      }

      if (viewingApp) {
        setViewingApp(null);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showForm, viewingApp]);

  const refreshCurrentPage = async () => {
    const result = await listApplications(API_MODE, query);
    const nextStats = await getApplicationStats(API_MODE, '').catch(() => EMPTY_STATS);
    setApplications(result.data);
    setPagination(result.pagination);
    setStats(nextStats);
  };

  const refreshStats = async () => {
    const nextStats = await getApplicationStats(API_MODE, '').catch(() => EMPTY_STATS);
    setStats(nextStats);
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
        const saved = await updateApplication(API_MODE, editingApp.id, formData);
        setApplications((current) => current.map((app) => (app.id === saved.id ? saved : app)));
        await refreshStats();
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
      const saved = await createApplication(API_MODE, formData);
      setApplications((current) => current.map((app) => (app.id === tempId ? saved : app)));
      setPagination((current) => ({ ...current, totalCount: current.totalCount + 1 }));
      await refreshStats();
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
      await deleteApplication(API_MODE, app.id);
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
    <>
    <nav className="top-nav" aria-label="Primary navigation">
      <a className="brand-mark" href="#dashboard" aria-label="Job Application Tracker home">
        JT
      </a>
      <div className="nav-links">
        <a href="#dashboard">Dashboard</a>
        <a href="#applications">Applications</a>
      </div>
    </nav>

    <main className="app-shell" id="dashboard">
      <header className="app-header">
        <div>
          <h1>Job Application Tracker</h1>
          <p>Track roles, compare outcomes, and keep your search moving.</p>
        </div>
        <button id="add" type="button" onClick={() => { setEditingApp(null); setShowForm(true); }}>
          Add Application
        </button>
      </header>

      <PipelineAnalytics stats={stats} loading={loading} />

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

      </section>

      {showForm && (
        <div className="modal-backdrop" role="presentation">
          <section
            className="form-panel modal-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="application-form-title"
          >
            <div className="modal-header">
              <h2 id="application-form-title">{editingApp ? 'Edit Application' : 'Add Application'}</h2>
              <button
                type="button"
                className="icon-button"
                aria-label="Close application form"
                onClick={() => { setShowForm(false); setEditingApp(null); }}
              >
                x
              </button>
            </div>
            <ApplicationForm
              key={editingApp?.id ?? 'new'}
              initialData={editingApp}
              saving={saving}
              onSubmit={handleFormSubmit}
              onCancel={() => { setShowForm(false); setEditingApp(null); }}
            />
          </section>
        </div>
      )}

      {viewingApp && (
        <div className="modal-backdrop" role="presentation">
          <section
            className="detail-panel modal-panel detail-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="application-detail-title"
          >
            <div className="modal-header">
              <div>
                <h2 id="application-detail-title">{viewingApp.company_name}</h2>
                <p>{viewingApp.job_title}</p>
              </div>
              <button
                type="button"
                className="icon-button"
                aria-label="Close application details"
                onClick={() => setViewingApp(null)}
              >
                x
              </button>
            </div>

            <dl className="detail-grid">
              <div>
                <dt>Status</dt>
                <dd><span className={`status status-${viewingApp.status.toLowerCase()}`}>{viewingApp.status}</span></dd>
              </div>
              <div>
                <dt>Job Type</dt>
                <dd>{viewingApp.job_type}</dd>
              </div>
              <div>
                <dt>Applied Date</dt>
                <dd>{viewingApp.applied_date ? viewingApp.applied_date.slice(0, 10) : 'Not set'}</dd>
              </div>
              <div>
                <dt>Notes</dt>
                <dd>{viewingApp.notes || 'No notes yet.'}</dd>
              </div>
            </dl>
          </section>
        </div>
      )}

      {loading && (
        <div className="skeleton-list" aria-label="Loading applications">
          <span />
          <span />
          <span />
        </div>
      )}
      {error && (
        <div className="message error" role="alert">
          <div>
            <strong>Could not load applications.</strong>
            <p>{error}</p>
          </div>
          <button type="button" className="secondary" onClick={() => setReloadToken((token) => token + 1)}>
            Retry
          </button>
        </div>
      )}
      {notice && !error && <div className="message success">{notice}</div>}

      {!loading && !error && (
        <>
          <section id="applications" aria-label="Applications">
            <ApplicationList
              applications={applications}
              onView={setViewingApp}
              onEdit={(app) => { setEditingApp(app); setShowForm(true); }}
              onDelete={handleDelete}
            />
          </section>

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
    </>
  );
}

export default App;
