// src/services/agentes.ts
import { apiClient } from './api';
import type { CatalogoAgente } from '@/types';

export const agentesService = {
  // Listar catálogo de agentes activos
  async getCatalogo(params?: { estado?: string }) {
    const response = await apiClient.get<CatalogoAgente[]>('/agentes/catalogo', {
      params,
    });
    return response.data;
  },

  // Obtener agente por ID
  async getById(id: string) {
    const response = await apiClient.get<CatalogoAgente>(`/agentes/catalogo/${id}`);
    return response.data;
  },
};