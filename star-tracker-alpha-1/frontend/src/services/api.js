// ============================================================
// STAR TRACKER ERP - API Service Layer
// Communicates with FastAPI Python Backend
// ============================================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export async function request(endpoint, options = {}) {
  // Normalize endpoint: ensure no double '/api' prefix
  let cleanEndpoint = endpoint;
  if (cleanEndpoint.startsWith('/api/')) {
    cleanEndpoint = cleanEndpoint.slice(4);
  } else if (cleanEndpoint === '/api') {
    cleanEndpoint = '/';
  }
  if (!cleanEndpoint.startsWith('/')) {
    cleanEndpoint = `/${cleanEndpoint}`;
  }

  const url = `${API_BASE_URL}${cleanEndpoint}`;

  const headers = {
    ...options.headers,
  };

  // Attach token from localStorage if available
  const token = localStorage.getItem('star_tracker_token');
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Set default JSON Content-Type if body is not FormData
  if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const config = {
    ...options,
    headers,
    credentials: 'include', // Support HTTP-only cookies
  };

  const response = await fetch(url, config);

  if (response.status === 401) {
    // If not on login page, clear token
    if (!window.location.pathname.includes('/login')) {
      localStorage.removeItem('star_tracker_token');
      localStorage.removeItem('star_tracker_user');
    }
  }

  // If response is a blob / file download
  const contentType = response.headers.get('content-type');
  if (contentType && (contentType.includes('spreadsheet') || contentType.includes('octet-stream') || contentType.includes('pdf'))) {
    if (!response.ok) throw new Error('File download failed');
    return response.blob();
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || data.error || data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  // Generic HTTP methods
  get: (endpoint, options = {}) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, data, options = {}) =>
    request(endpoint, {
      ...options,
      method: 'POST',
      body: data instanceof FormData ? data : (data !== undefined ? JSON.stringify(data) : undefined),
    }),
  put: (endpoint, data, options = {}) =>
    request(endpoint, {
      ...options,
      method: 'PUT',
      body: data instanceof FormData ? data : (data !== undefined ? JSON.stringify(data) : undefined),
    }),
  patch: (endpoint, data, options = {}) =>
    request(endpoint, {
      ...options,
      method: 'PATCH',
      body: data instanceof FormData ? data : (data !== undefined ? JSON.stringify(data) : undefined),
    }),
  delete: (endpoint, options = {}) => request(endpoint, { ...options, method: 'DELETE' }),

  // Auth
  login: (email, password, role) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    }),
  logout: () =>
    request('/auth/logout', {
      method: 'POST',
    }),
  getMe: () => request('/auth/me'),

  // Master Data
  getVerticals: () => request('/verticals'),
  getSystemSettings: () => request('/system-settings'),
  getClasses: () => request('/classes'),
  getActivities: (verticalId) => request(`/activities${verticalId ? `?vertical_id=${verticalId}` : ''}`),
  getActivityLevels: (activityId) => request(`/activity-levels${activityId ? `?activity_id=${activityId}` : ''}`),

  // Student
  getStudentDashboard: () => request('/student/dashboard'),
  getStudentCertificates: (status) =>
    request(`/student/certificates${status ? `?status_filter=${status}` : ''}`),
  submitCertificate: (formData) =>
    request('/student/submit', {
      method: 'POST',
      body: formData,
    }),

  // Advisor
  getAdvisorDashboard: (classId) =>
    request(`/advisor/dashboard${classId ? `?class_id=${classId}` : ''}`),
  getStudentCertificatesForAdvisor: (studentId) =>
    request(`/advisor/students/${studentId}/certificates`),
  reviewCertificate: (id, action, advisor_remarks) =>
    request(`/certificates/${id}/review`, {
      method: 'POST',
      body: JSON.stringify({ action, advisor_remarks }),
    }),

  // HOD & Reports
  getHodDashboard: () => request('/hod/dashboard'),
  getHodStats: () => request('/hod/stats'),
  getHodAdvisors: () => request('/hod/advisors'),
  getHodStudents: () => request('/hod/students'),
  getHodSwot: () => request('/hod/swot'),
  getDetailedSubmissions: (params = {}) => {
    const query = new URLSearchParams();
    if (params.class_id) query.append('class_id', params.class_id);
    if (params.vertical_id) query.append('vertical_id', params.vertical_id);
    if (params.activity_id) query.append('activity_id', params.activity_id);
    if (params.status_filter) query.append('status_filter', params.status_filter);
    const qStr = query.toString();
    return request(`/reports/detailed-submissions${qStr ? `?${qStr}` : ''}`);
  },

  // Dean Executive Endpoints
  getDeanDashboard: () => request('/dean/dashboard'),
  getDeanDepartments: (deptId) => request(`/dean/departments${deptId ? `?department_id=${deptId}` : ''}`),
  getDeanVerticals: (verticalId) => request(`/dean/verticals${verticalId ? `?vertical_id=${verticalId}` : ''}`),
  getDeanStudents: (params = {}) => {
    const q = new URLSearchParams();
    if (params.search) q.append('search', params.search);
    if (params.department_id) q.append('department_id', params.department_id);
    if (params.class_id) q.append('class_id', params.class_id);
    if (params.vertical_id) q.append('vertical_id', params.vertical_id);
    if (params.activity_id) q.append('activity_id', params.activity_id);
    if (params.status) q.append('status', params.status);
    if (params.year) q.append('year', params.year);
    if (params.page) q.append('page', params.page);
    if (params.limit) q.append('limit', params.limit);
    const qStr = q.toString();
    return request(`/dean/students${qStr ? `?${qStr}` : ''}`);
  },
  getDeanStudentDetail: (id) => request(`/dean/students/${id}`),
  getDeanSwot: () => request('/dean/swot'),
  getDeanReports: (params = {}) => {
    const q = new URLSearchParams();
    if (params.type) q.append('type', params.type);
    if (params.department_id) q.append('department_id', params.department_id);
    if (params.vertical_id) q.append('vertical_id', params.vertical_id);
    const qStr = q.toString();
    return request(`/dean/reports${qStr ? `?${qStr}` : ''}`);
  },

  // Principal College-Wide Executive Endpoints
  getPrincipalDashboard: () => request('/principal/dashboard'),
  getPrincipalSchools: () => request('/principal/schools'),
  getPrincipalProgrammes: (params = {}) => {
    const schoolId = typeof params === 'object' ? params?.school_id : params;
    return request(`/principal/programmes${schoolId ? `?school_id=${schoolId}` : ''}`);
  },
  getPrincipalStudents: (params = {}) => {
    const q = new URLSearchParams();
    if (params.search) q.append('search', params.search);
    if (params.school_id) q.append('school_id', params.school_id);
    if (params.department_id) q.append('department_id', params.department_id);
    if (params.class_id) q.append('class_id', params.class_id);
    if (params.page) q.append('page', params.page);
    if (params.page_size || params.limit) q.append('page_size', params.page_size || params.limit);
    const qStr = q.toString();
    return request(`/principal/students${qStr ? `?${qStr}` : ''}`);
  },
  getPrincipalAchievements: (params = {}) => {
    const q = new URLSearchParams();
    if (params.search) q.append('search', params.search);
    if (params.school_id) q.append('school_id', params.school_id);
    if (params.department_id) q.append('department_id', params.department_id);
    if (params.vertical_id) q.append('vertical_id', params.vertical_id);
    if (params.status) q.append('status', params.status);
    if (params.page) q.append('page', params.page);
    if (params.page_size || params.limit) q.append('page_size', params.page_size || params.limit);
    const qStr = q.toString();
    return request(`/principal/achievements${qStr ? `?${qStr}` : ''}`);
  },
  getPrincipalReports: (params = {}) => {
    const q = new URLSearchParams();
    if (params.type) q.append('type', params.type);
    if (params.school_id) q.append('school_id', params.school_id);
    if (params.department_id) q.append('department_id', params.department_id);
    const qStr = q.toString();
    return request(`/principal/reports${qStr ? `?${qStr}` : ''}`);
  },

  // Admin
  getAdminStats: () => request('/admin/stats'),
  getAdminSettings: () => request('/admin/settings'),
  updateAdminSettings: (data) => request('/admin/settings', { method: 'POST', body: JSON.stringify(data) }),
  getAdminUsers: (role) => request(`/admin/users${role ? `?role=${role}` : ''}`),
  createAdminUser: (userData) =>
    request('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  editAdminUser: (id, userData) =>
    request(`/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    }),
  deleteAdminUser: (id) =>
    request(`/admin/users/${id}`, {
      method: 'DELETE',
    }),
  resetUserPassword: (id, new_password) =>
    request(`/admin/users/${id}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ new_password }),
    }),
  updateRules: (ruleData) =>
    request('/admin/rules', {
      method: 'PUT',
      body: JSON.stringify(ruleData),
    }),
  getAdminAuditLogs: () => request('/admin/audit-logs'),

  // Leaderboard
  getLeaderboard: (params = {}) => {
    if (typeof params === 'object' && params !== null) {
      const q = new URLSearchParams();
      if (params.class_id || params.classId) q.append('class_id', params.class_id || params.classId);
      if (params.year) q.append('year', params.year);
      const qStr = q.toString();
      return request(`/leaderboard${qStr ? `?${qStr}` : ''}`);
    }
    return request(`/leaderboard${params ? `?class_id=${params}` : ''}`);
  },

  // Notifications
  getNotifications: () => request('/notifications'),
  markNotificationRead: (id) =>
    request(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () =>
    request('/notifications/read-all', { method: 'PUT' }),

  // Excel Reports
  exportClassExcel: async (classId) => {
    const blob = await request(`/reports/export${classId ? `?class_id=${classId}` : ''}`);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Star_Tracker_Class_${classId || 'Report'}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },
  importStudentsExcel: (classId, file) => {
    const formData = new FormData();
    formData.append('class_id', classId);
    formData.append('file', file);
    return request('/reports/import', {
      method: 'POST',
      body: formData,
    });
  },
};
