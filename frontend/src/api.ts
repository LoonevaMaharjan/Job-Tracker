import type { ApiMode, ApplicationInput, ApplicationsResponse, JobApplication } from './types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

interface ListParams {
  status: string;
  search: string;
  page: number;
  limit: number;
}

async function parseJson<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      payload?.error ||
      payload?.errors?.[0]?.message ||
      payload?.errors?.company_name ||
      'Request failed. Please try again.';
    throw new Error(message);
  }

  return payload as T;
}

async function graphql<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${API_URL}/graphql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  const payload = await parseJson<{ data?: T; errors?: Array<{ message: string }> }>(response);

  if (payload.errors?.length) {
    throw new Error(payload.errors[0]?.message ?? 'GraphQL request failed.');
  }

  if (!payload.data) {
    throw new Error('GraphQL response did not include data.');
  }

  return payload.data;
}

export async function listApplications(mode: ApiMode, params: ListParams): Promise<ApplicationsResponse> {
  if (mode === 'graphql') {
    const data = await graphql<{ applications: ApplicationsResponse }>(
      `query Applications($status: String, $search: String, $page: Int, $limit: Int) {
        applications(status: $status, search: $search, page: $page, limit: $limit) {
          data { id company_name job_title job_type status applied_date notes }
          pagination { page limit totalCount totalPages }
        }
      }`,
      {
        status: params.status === 'All' ? undefined : params.status,
        search: params.search || undefined,
        page: params.page,
        limit: params.limit,
      },
    );
    return data.applications;
  }

  const searchParams = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });

  if (params.status !== 'All') searchParams.set('status', params.status);
  if (params.search.trim()) searchParams.set('search', params.search.trim());

  const response = await fetch(`${API_URL}/applications?${searchParams.toString()}`);
  return parseJson<ApplicationsResponse>(response);
}

export async function createApplication(mode: ApiMode, input: ApplicationInput): Promise<JobApplication> {
  if (mode === 'graphql') {
    const data = await graphql<{ createApplication: JobApplication }>(
      `mutation CreateApplication($input: ApplicationInput!) {
        createApplication(input: $input) { id company_name job_title job_type status applied_date notes }
      }`,
      { input },
    );
    return data.createApplication;
  }

  const response = await fetch(`${API_URL}/applications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return parseJson<JobApplication>(response);
}

export async function updateApplication(
  mode: ApiMode,
  id: string,
  input: ApplicationInput,
): Promise<JobApplication> {
  if (mode === 'graphql') {
    const data = await graphql<{ updateApplication: JobApplication }>(
      `mutation UpdateApplication($id: ID!, $input: ApplicationInput!) {
        updateApplication(id: $id, input: $input) { id company_name job_title job_type status applied_date notes }
      }`,
      { id, input },
    );
    return data.updateApplication;
  }

  const response = await fetch(`${API_URL}/applications/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return parseJson<JobApplication>(response);
}

export async function deleteApplication(mode: ApiMode, id: string): Promise<void> {
  if (mode === 'graphql') {
    await graphql<{ deleteApplication: boolean }>(
      `mutation DeleteApplication($id: ID!) {
        deleteApplication(id: $id)
      }`,
      { id },
    );
    return;
  }

  const response = await fetch(`${API_URL}/applications/${id}`, { method: 'DELETE' });
  if (!response.ok) {
    throw new Error('Failed to delete application.');
  }
}
