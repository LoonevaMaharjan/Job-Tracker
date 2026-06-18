import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import type { ApplicationInput, JobApplication } from '../types';

const JOB_TYPES: ApplicationInput['job_type'][] = ['Internship', 'Full-time', 'Part-time'];
const STATUSES: ApplicationInput['status'][] = ['Applied', 'Interviewing', 'Offer', 'Rejected'];

interface ApplicationFormProps {
  initialData: JobApplication | null;
  saving: boolean;
  onSubmit: (formData: ApplicationInput) => void;
  onCancel: () => void;
}

type FormErrors = Partial<Record<keyof ApplicationInput, string>>;

function toInput(initialData: JobApplication | null): ApplicationInput {
  return {
    company_name: initialData?.company_name || '',
    job_title: initialData?.job_title || '',
    job_type: initialData?.job_type || 'Full-time',
    status: initialData?.status || 'Applied',
    applied_date: initialData?.applied_date?.slice(0, 10) || '',
    notes: initialData?.notes || '',
  };
}

function ApplicationForm({ initialData, saving, onSubmit, onCancel }: ApplicationFormProps) {
  const [formData, setFormData] = useState<ApplicationInput>(() => toInput(initialData));
  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors: FormErrors = {};
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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="application-form">
      <label>
        Company Name *
        <input type="text" name="company_name" value={formData.company_name} onChange={handleChange} />
        {errors.company_name && <span className="field-error">{errors.company_name}</span>}
      </label>

      <label>
        Job Title *
        <input type="text" name="job_title" value={formData.job_title} onChange={handleChange} />
        {errors.job_title && <span className="field-error">{errors.job_title}</span>}
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
          {STATUSES.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </label>

      <label>
        Applied Date *
        <input type="date" name="applied_date" value={formData.applied_date} onChange={handleChange} />
        {errors.applied_date && <span className="field-error">{errors.applied_date}</span>}
      </label>

      <label>
        Notes
        <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} />
      </label>

      <div className="form-actions">
        <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        <button type="button" className="secondary" onClick={onCancel} disabled={saving}>Cancel</button>
      </div>
    </form>
  );
}

export default ApplicationForm;
