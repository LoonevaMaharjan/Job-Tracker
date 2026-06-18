-- This lets PostgreSQL auto-generate unique IDs (UUIDs) for each row
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Custom types so job_type and status can only ever be one of these fixed values
CREATE TYPE job_type_enum AS ENUM ('Internship', 'Full-time', 'Part-time');
CREATE TYPE status_enum AS ENUM ('Applied', 'Interviewing', 'Offer', 'Rejected');

-- The main table that stores each job application
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL CHECK (char_length(company_name) >= 2),
    job_title VARCHAR(255) NOT NULL,
    job_type job_type_enum NOT NULL DEFAULT 'Full-time',
    status status_enum NOT NULL DEFAULT 'Applied',
    applied_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Some sample rows so you have data to look at right away
INSERT INTO applications (company_name, job_title, job_type, status, applied_date, notes)
VALUES
    ('Acme Corp', 'Frontend Developer', 'Full-time', 'Interviewing', '2026-05-10', 'Recruiter call went well.'),
    ('Globex Inc', 'Backend Engineer Intern', 'Internship', 'Applied', '2026-06-01', NULL),
    ('Initech', 'Full Stack Developer', 'Full-time', 'Offer', '2026-04-20', 'Negotiating salary.'),
    ('Umbrella Co', 'React Developer', 'Part-time', 'Rejected', '2026-03-15', 'Rejected after final round.');