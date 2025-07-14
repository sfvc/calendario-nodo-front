// src/lib/eventApi.ts
import { api } from './api';

const BASE_PATH = '/events';

export const EventAPI = {
  
  getAll: async () => {
  const data = await api<any[]>(BASE_PATH);

    return data.map(event => ({
      ...event,
      start: new Date(event.start),
      end: new Date(event.end),
    }));
  },

  create: async (data: any) => {
    return api<any>(BASE_PATH, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },



  update: async (id: string, data: any) => {
    return api<any>(`${BASE_PATH}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  remove: async (id: string) => {
    return api<void>(`${BASE_PATH}/${id}`, {
      method: 'DELETE',
    });
  },

  getById: async (id: string) => {
    return api<any>(`${BASE_PATH}/${id}`);
  },
};