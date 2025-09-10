import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.unvgroup.tech' // Sua URL base da API
} );

export default api;
