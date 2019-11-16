import axios from 'axios';

const api = axios.create({
 baseURL: 'https://2f9c11a5.ngrok.io',
});

export default api;