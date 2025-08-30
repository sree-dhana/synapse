
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');
  return !!(token && username);
};

export const getAuthUser = () => {
  return {
    token: localStorage.getItem('token'),
    username: localStorage.getItem('username'),
    userRole: localStorage.getItem('userRole'),
    email: localStorage.getItem('userEmail')
  };
};

export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userEmail');
};

export const setAuth = (token, username, userRole = 'student', email = null) => {
  localStorage.setItem('token', token);
  localStorage.setItem('username', username);
  localStorage.setItem('userRole', userRole);
  if (email) {
    localStorage.setItem('userEmail', email);
  }
};
