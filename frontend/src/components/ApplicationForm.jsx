import { useState } from 'react';

const JOB_TYPES = ['Internship', 'Full-time', 'Part-time'];
const STATUSES = ['Applied', 'Interviewing', 'Offer', 'Rejected'];

function ApplicationForm({ initialData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    company_name: initialData?.company_name || '',
    job_title: initialData?.job_title || '',
    job_type: initialData?.job_type || 'Full-time',
    status: initialData?.status || 'Applied',
    applied_date: initialData?.applied_date || '',
    notes: initialData?.notes || '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.company_name || formData.company_name.trim().length < 2) {
      newErrors.company_name = 'Company name must be at least 2 characters.';
    }
    if (!formData.job_title || formData.job_title.trim().length === 0) {
      newErrors.job_title = 'Job title is required.';
    }
    if (!formData.applied_date) {
      newErrors.applied_date = 'Applied date is required.';
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // stops the browser's default page-reload-on-submit behavior

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '400px' }}>
      <label>
        Company Name *
        <input
          type="text"
          name="company_name"
          value={formData.company_name}
          onChange={handleChange}
        />
        {errors.company_name && <p style={{ color: 'red', margin: 0 }}>{errors.company_name}</p>}
      </label>

      <label>
        Job Title *
        <input
          type="text"
          name="job_title"
          value={formData.job_title}
          onChange={handleChange}
        />
        {errors.job_title && <p style={{ color: 'red', margin: 0 }}>{errors.job_title}</p>}
      </label>

      <label>
        Job Type
        <select name="job_type" value={formData.job_type} onChange={handleChange}>
          {JOB_TYPES.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </label>

      <label>
        Status
        <select name="status" value={formData.status} onChange={handleChange}>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </label>

      <label>
        Applied Date *
        <input
          type="date"
          name="applied_date"
          value={formData.applied_date}
          onChange={handleChange}
        />
        {errors.applied_date && <p style={{ color: 'red', margin: 0 }}>{errors.applied_date}</p>}
      </label>

      <label>
        Notes
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
        />
      </label>

      <div>
        <button type="submit">Save</button>{' '}
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

export default ApplicationForm;