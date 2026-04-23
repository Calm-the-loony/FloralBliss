export const getApiUrl = (endpoint) => {
  if (process.env.NODE_ENV === 'production') {
    return `/api${endpoint}`;
  }
  
  return `http://localhost:5000/api${endpoint}`;
};

export const API_URL = getApiUrl('');