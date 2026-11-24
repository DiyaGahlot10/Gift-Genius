import axios from 'axios';

// Single Axios instance for the whole app.
// In dev, Vite proxies /api to the Express server, so a relative base URL works.
// withCredentials sends the httpOnly JWT cookie on every request.
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  timeout: 15000,
});

// Normalise errors so UI code can always read `error.message`.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      (error.code === 'ECONNABORTED'
        ? 'The request timed out. Please try again.'
        : error.request && !error.response
        ? 'Cannot reach the server. Is the API running?'
        : error.message) ||
      'Something went wrong';
    error.message = message;
    error.status = error.response?.status;
    return Promise.reject(error);
  }
);

export default api;
