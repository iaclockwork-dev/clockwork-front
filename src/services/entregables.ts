// src/services/entregables.ts

import { apiClient } from './api';
import type {
  Entregable,
  CrearEntregableRequest,
  AgenteRecomendado,
  EntregableLight,
} from '@/types';

export const entregablesService = {
  // ------------------------------------------------------------
  // 🔵 LISTA COMPLETA (PESADA)
  // ------------------------------------------------------------
  async getAll(params?: { estado?: string; skip?: number; limit?: number }) {
    const response = await apiClient.get<Entregable[]>('/entregables/', {
      params,
    });
    return response.data;
  },

  // ------------------------------------------------------------
  // 🔵 DETALLE COMPLETO (PESADO)
  // ------------------------------------------------------------
  async getById(id: string) {
    const response = await apiClient.get<Entregable>(`/entregables/${id}`);
    return response.data;
  },

  // ------------------------------------------------------------
  // 🟢 LISTA LIGERA (ULTRA FAST)
  // ------------------------------------------------------------
  async getAllLight() {
    const response = await apiClient.get<EntregableLight[]>('/entregables-light/light');
    return response.data; // { id, folio, tema, estado, progreso }
  },

  // ------------------------------------------------------------
  // 🟢 DETALLE LIGERO (ULTRA FAST)
  // ------------------------------------------------------------
  async getByIdLight(id: string) {
    const response = await apiClient.get<EntregableLight>(`/entregables-light/${id}/light`);
    return response.data; // { id, folio, tema, estado, progreso, documento_final_url }
  },

  // ------------------------------------------------------------
  // CREAR ENTREGABLE
  // ------------------------------------------------------------
  async create(data: CrearEntregableRequest) {
    const response = await apiClient.post<Entregable>('/entregables/', data);
    return response.data;
  },

  // ------------------------------------------------------------
  // GENERAR TEMARIO
  // ------------------------------------------------------------
  async generarTemario(id: string) {
    const response = await apiClient.post(`/entregables/${id}/generar-temario`);
    return response.data;
  },

  // ------------------------------------------------------------
  // RECOMENDAR AGENTES
  // ------------------------------------------------------------
  async recomendarAgentes(id: string) {
    const response = await apiClient.post<{
      agentes_recomendados: AgenteRecomendado[];
    }>(`/entregables/${id}/recomendar-agentes`);
    return response.data;
  },

  // ------------------------------------------------------------
  // APROBAR TEMARIO + AGENTES
  // ------------------------------------------------------------
  async aprobar(id: string, data: { temario_aprobado: any; agentes_aprobados: any[] }) {
    const response = await apiClient.post(`/entregables/${id}/aprobar`, data);
    return response.data;
  },

  // ------------------------------------------------------------
  // EJECUTAR GENERACIÓN DEL DOCUMENTO
  // ------------------------------------------------------------
  async generar(id: string) {
    const response = await apiClient.post(`/entregables/${id}/generar`);
    return response.data;
  },

  // ------------------------------------------------------------
  // STATUS TIEMPO REAL
  // ------------------------------------------------------------
  async getStatus(id: string) {
    const response = await apiClient.get(`/entregables/${id}/status`);
    return response.data;
  },

  // ------------------------------------------------------------
  // DESCARGAR DOCUMENTO FINAL (URL DIRECTA)
  // ------------------------------------------------------------
  async descargarDocumento(documentoUrl: string | null | undefined) {
    if (!documentoUrl) {
      console.error("❌ documentoUrl está vacío, no se puede descargar");
      return;
    }

    console.log("⬇️ Descargando documento desde URL directa:", documentoUrl);

    window.open(documentoUrl, "_blank");
  },
};
