// ══════════════════════════════════════════════════
// FastShip Express — API Client
// يتواصل مع الباك اند عبر /api/
// ══════════════════════════════════════════════════

const API_BASE = '/api';

// ── Core fetch helper ─────────────────────────────
async function apiCall(endpoint, method = 'GET', body = null) {
  const token = localStorage.getItem('fs_token');
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': 'Bearer ' + token } : {})
    }
  };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(API_BASE + endpoint, opts);

  // Token expired
  if (res.status === 401) {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = 'login.html';
    return;
  }

  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}

// ── Auth ──────────────────────────────────────────
const Auth = {
  login:  (username, password) => apiCall('/auth/login', 'POST', { username, password }),
  me:     ()                   => apiCall('/auth/me'),
};

// ── Dashboard ─────────────────────────────────────
const Dashboard = {
  get: () => apiCall('/dashboard'),
};

// ── Shipments ─────────────────────────────────────
const Shipments = {
  list:         (params = {}) => apiCall('/shipments?' + new URLSearchParams(params)),
  get:          (id)          => apiCall(`/shipments/${id}`),
  create:       (data)        => apiCall('/shipments', 'POST', data),
  update:       (id, data)    => apiCall(`/shipments/${id}`, 'PUT', data),
  changeStatus: (id, status, reason_id, note) =>
                               apiCall(`/shipments/${id}/status`, 'PATCH', { status, reason_id, note }),
  assign:       (id, agent_id) => apiCall(`/shipments/${id}/assign`, 'PATCH', { agent_id }),
  delete:       (id)           => apiCall(`/shipments/${id}`, 'DELETE'),
};

// ── Merchants ─────────────────────────────────────
const Merchants = {
  list:   (params = {}) => apiCall('/merchants?' + new URLSearchParams(params)),
  get:    (id)          => apiCall(`/merchants/${id}`),
  create: (data)        => apiCall('/merchants', 'POST', data),
  update: (id, data)    => apiCall(`/merchants/${id}`, 'PUT', data),
  delete: (id)          => apiCall(`/merchants/${id}`, 'DELETE'),
};

// ── Agents ────────────────────────────────────────
const Agents = {
  list:   (params = {}) => apiCall('/agents?' + new URLSearchParams(params)),
  get:    (id)          => apiCall(`/agents/${id}`),
  create: (data)        => apiCall('/agents', 'POST', data),
  update: (id, data)    => apiCall(`/agents/${id}`, 'PUT', data),
  delete: (id)          => apiCall(`/agents/${id}`, 'DELETE'),
};

// ── Returns ───────────────────────────────────────
const Returns = {
  list:   (params = {}) => apiCall('/returns?' + new URLSearchParams(params)),
  create: (data)        => apiCall('/returns', 'POST', data),
  update: (id, data)    => apiCall(`/returns/${id}`, 'PUT', data),
  delete: (id)          => apiCall(`/returns/${id}`, 'DELETE'),
};

// ── Expenses ──────────────────────────────────────
const Expenses = {
  list:   (params = {}) => apiCall('/expenses?' + new URLSearchParams(params)),
  create: (data)        => apiCall('/expenses', 'POST', data),
  update: (id, data)    => apiCall(`/expenses/${id}`, 'PUT', data),
  delete: (id)          => apiCall(`/expenses/${id}`, 'DELETE'),
};

// ── Transfers ─────────────────────────────────────
const Transfers = {
  list:   (params = {}) => apiCall('/transfers?' + new URLSearchParams(params)),
  create: (data)        => apiCall('/transfers', 'POST', data),
};

// ── Settings ──────────────────────────────────────
const Settings = {
  // Cities
  getCities:    ()         => apiCall('/settings/cities'),
  createCity:   (data)     => apiCall('/settings/cities', 'POST', data),
  updateCity:   (id, data) => apiCall(`/settings/cities/${id}`, 'PUT', data),

  // Zones
  getZones:     (city_id)  => apiCall('/settings/zones' + (city_id ? '?city_id=' + city_id : '')),
  createZone:   (data)     => apiCall('/settings/zones', 'POST', data),
  updateZone:   (id, data) => apiCall(`/settings/zones/${id}`, 'PUT', data),

  // Branches
  getBranches:  ()         => apiCall('/settings/branches'),
  createBranch: (data)     => apiCall('/settings/branches', 'POST', data),
  updateBranch: (id, data) => apiCall(`/settings/branches/${id}`, 'PUT', data),

  // Roles
  getRoles:     ()         => apiCall('/settings/roles'),
  createRole:   (data)     => apiCall('/settings/roles', 'POST', data),
  updateRole:   (id, data) => apiCall(`/settings/roles/${id}`, 'PUT', data),

  // Users
  getUsers:     ()         => apiCall('/settings/users'),
  createUser:   (data)     => apiCall('/settings/users', 'POST', data),
  updateUser:   (id, data) => apiCall(`/settings/users/${id}`, 'PUT', data),

  // Reasons
  getReasons:   ()         => apiCall('/settings/reasons'),
  createReason: (data)     => apiCall('/settings/reasons', 'POST', data),
  updateReason: (id, data) => apiCall(`/settings/reasons/${id}`, 'PUT', data),
};
