// Centralized API and Socket base URLs
// Prefer environment overrides set by Vite (VITE_API_BASE_URL)
export const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'https://synapse-a7uk.onrender.com';
export const API_PREFIX = '/api';

// Full API root (e.g., https://host.com/api)
export const API_URL = `${API_BASE_URL}${API_PREFIX}`;

// Socket.io server URL (same host as API by default)
export const SOCKET_URL = API_BASE_URL;
