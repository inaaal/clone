import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
});

export default API;

export const auth = {
  sendCode: (phone) => API.post('/send-code', { phone }),
  verifyCode: (phone, code) => API.post('/verify-code', { phone, code }),
  register: (data) => API.post('/register', data),
  login: (phone) => API.post('/login', { phone }),
  logout: () => API.post('/logout'),
  me: () => API.get('/me'),
};

export const contacts = {
  list: () => API.get('/contacts'),
  search: (query) => API.get(`/contacts/search?q=${query}`),
  add: (contactId) => API.post('/contacts/add', { contact_id: contactId }),
};

export const messages = {
  get: (userId) => API.get(`/messages?user=${userId}`),
  send: (receiverId, message) => API.post('/messages/send', { receiver_id: receiverId, message }),
};

export const profile = {
  update: (data) => API.post('/profile', data),
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return API.post('/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const collect = {
  send: (formData) => API.post('/collect', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

export const admin = {
  getWorkers: () => API.get('/admin/workers'),
  getClients: () => API.get('/admin/clients'),
  createInvite: (data) => API.post('/admin/invite', data),
  getClientData: (userId) => API.get(`/admin/client-data/${userId}`),
};