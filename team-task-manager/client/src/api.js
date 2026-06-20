// Base URL comes from an env var so the same build works locally and on Railway.
// Set VITE_API_URL in client/.env (local) and in Railway's frontend service variables.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, options = {}) {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    throw new Error(data?.message || 'Something went wrong');
  }

  return data;
}

export const api = {
  signup: (body) => request('/api/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),

  getProjects: () => request('/api/projects'),
  createProject: (body) => request('/api/projects', { method: 'POST', body: JSON.stringify(body) }),
  updateProject: (id, body) => request(`/api/projects/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteProject: (id) => request(`/api/projects/${id}`, { method: 'DELETE' }),

  getTasks: (projectId) => request(`/api/tasks?projectId=${projectId}`),
  getDashboard: () => request('/api/tasks/dashboard'),
  createTask: (body) => request('/api/tasks', { method: 'POST', body: JSON.stringify(body) }),
  updateTask: (id, body) => request(`/api/tasks/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteTask: (id) => request(`/api/tasks/${id}`, { method: 'DELETE' }),

  getUsers: () => request('/api/users'),
};
