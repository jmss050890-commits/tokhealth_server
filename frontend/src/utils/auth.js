// Auth utility functions for frontend

export const getAuthHeaders = () => {
  const token = localStorage.getItem('tokhealth_token');
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('tokhealth_user');
  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('tokhealth_token');
};

export const logout = () => {
  localStorage.removeItem('tokhealth_token');
  localStorage.removeItem('tokhealth_user');
};
