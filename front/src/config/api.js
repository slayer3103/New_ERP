// src/config/api.js
// Central API base URL config.
// In Docker production, Nginx proxies /api/ → backend:5000/api/
// In local dev, you can set REACT_APP_API_URL=http://localhost:5000/api in .env

const BASE_URL = process.env.REACT_APP_API_URL || '/api';

export default BASE_URL;
