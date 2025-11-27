// src/services/emisores.ts
import { apiClient } from './api';
import type { Emisor } from '@/types';

export const emisoresService = {
  // Listar emisores
  async getAll() {
    const response = await apiClient.get<Emisor[]>('/emisores/');
    return response.data;
  },

  // Obtener emisor por ID
  async getById(id: string) {
    const response = await apiClient.get<Emisor>(`/emisores/${id}`);
    return response.data;
  },

  // Crear emisor
  async create(data: Partial<Emisor>) {
    const response = await apiClient.post<Emisor>('/emisores/', data);
    return response.data;
  },
};