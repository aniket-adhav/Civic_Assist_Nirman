const BASE = '/api';

function getAuth() {
  return localStorage.getItem('ca_userId');
}

function getAdminAuth() {
  return localStorage.getItem('ca_token');
}

function headers(extra = {}) {
  const h = { ...extra };
  const userId = getAuth();
  if (userId) h['Authorization'] = `Bearer ${userId}`;
  return h;
}

function adminHeaders(extra = {}) {
  const h = { ...extra };
  const token = getAdminAuth();
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

async function handle(res) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  async sendOtp(phone) {
    return handle(await fetch(`${BASE}/auth/send-otp`, {
      method: 'POST',
      headers: headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ phone }),
    }));
  },

  async verifyOtp(phone) {
    return handle(await fetch(`${BASE}/auth/verify-otp`, {
      method: 'POST',
      headers: headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ phone }),
    }));
  },

  async completeProfile(name) {
    return handle(await fetch(`${BASE}/auth/complete-profile`, {
      method: 'POST',
      headers: headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ name }),
    }));
  },

  async adminLogin(adminId, password) {
    return handle(await fetch(`${BASE}/auth/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminId, password }),
    }));
  },

  async getIssues() {
    return handle(await fetch(`${BASE}/issues`, { headers: headers() }));
  },

  async submitIssue(formData) {
    return handle(await fetch(`${BASE}/issues`, {
      method: 'POST',
      headers: headers(),
      body: formData,
    }));
  },

  async toggleLike(issueId) {
    return handle(await fetch(`${BASE}/issues/${issueId}/like`, {
      method: 'POST',
      headers: headers(),
    }));
  },

  async postComment(issueId, text) {
    return handle(await fetch(`${BASE}/issues/${issueId}/comments`, {
      method: 'POST',
      headers: headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ text }),
    }));
  },

  async getAdminIssues() {
    return handle(await fetch(`${BASE}/admin/issues`, { headers: adminHeaders() }));
  },

  async getAdminStats() {
    return handle(await fetch(`${BASE}/admin/stats`, { headers: adminHeaders() }));
  },

  async updateIssueStatus(issueId, status) {
    return handle(await fetch(`${BASE}/admin/issues/${issueId}/status`, {
      method: 'PATCH',
      headers: adminHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ status }),
    }));
  },

  async assignIssueDept(issueId, department) {
    return handle(await fetch(`${BASE}/admin/issues/${issueId}/assign`, {
      method: 'PATCH',
      headers: adminHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ department }),
    }));
  },

  async reanalyzeIssue(issueId) {
    return handle(await fetch(`${BASE}/admin/issues/${issueId}/reanalyze`, {
      method: 'POST',
      headers: adminHeaders(),
    }));
  },

  async getAdminIssueById(issueId) {
    return handle(await fetch(`${BASE}/admin/issues/${issueId}`, { headers: adminHeaders() }));
  },

  async getOfficers() {
    return handle(await fetch(`${BASE}/admin/officers`, { headers: adminHeaders() }));
  },

  async addOfficer(officerData) {
    return handle(await fetch(`${BASE}/admin/officers`, {
      method: 'POST',
      headers: adminHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(officerData),
    }));
  },

  async getAdminAnalysis() {
    return handle(await fetch(`${BASE}/admin/analysis`, { headers: adminHeaders() }));
  },
};
