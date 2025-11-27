// src/types/index.ts

export interface Emisor {
  id: number;
  nombre: string;
  razon_social: string;
  rfc: string;
  email?: string;
  telefono?: string;
  direccion?: string;
}

export interface CatalogoAgente {
  id: string;
  rfc: string;
  tipo: string;
  nombre_display: string;
  descripcion: string;
  especialidad: string;
  icono: string;
  prompt_system: string;
  costo_por_cuartilla: number;
  tags: string[];
  estado: 'ACTIVO' | 'INACTIVO';
}

export interface AgenteRecomendado {
  catalogo_agente_id: string;
  tipo: string;
  nombre_display: string;
  icono: string;
  justificacion: string;
  tareas: string[];
  seccion_documento: string;
  cuartillas_asignadas: number;
  prioridad: number;
  dependencias: string[];
  costo_estimado: number;
}

// ← NUEVO: Interfaz para agentes ya asignados
export interface AgenteAsignado {
  id: string;
  catalogo_agente_id: string;
  nombre_display: string;
  icono: string;
  cuartillas_asignadas: number;
  seccion_documento?: string;
  estado: string;
  tareas: string[];
  prioridad: number;
  costo_estimado?: number;
}

export interface Entregable {
  id: string;
  folio: string;
  tema: string;
  descripcion?: string;
  temario_descripcion?: string;  // ← Agregar este también
  cuartillas_solicitadas: number;
  estado: 'borrador' | 'en_proceso' | 'completado' | 'error' | 'COTIZACION' | 'EN_PROCESO' | 'COMPLETADO';  // ← Agregar estados de backend
  etapa_actual: string;
  progreso_porcentaje: number;
  temario_generado?: any;
  temario_sugerido?: any;  // ← Agregar
  temario_aprobado?: any;
  agentes_recomendados?: AgenteRecomendado[];
  agentes_asignados?: AgenteAsignado[];  // ← AGREGAR ESTA LÍNEA
  documento_final_id?: string | null;  // ← Agregar esta línea
  documento_final_url?: string | null; // ← Agregar esta línea
  emisor?: Emisor;
  emisor_id?: string;
  total_tokens_utilizados?: number;
  costo_real_tokens?: number;
  costo_estimado?: number;
  tiempo_estimado_minutos?: number;
  tiempo_real_generacion_segundos?: number;
  fecha_creacion?: string;
  fecha_solicitud?: string;  // ← Agregar
  fecha_completado?: string;
  tono?: string;
  audiencia?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EntregableLight {
  id: string;
  folio: string;
  tema: string;
  estado: string;
  progreso: number;
  fecha_solicitud: string | null;
  documento_final_url: string | null;
  etapa_actual: string;
  cuartillas_solicitadas: number; 
}



export interface CrearEntregableRequest {
  tema: string;
  temario_descripcion: string;  // ← Cambiar de "descripcion"
  cuartillas_solicitadas: number;
  numero_documentos_referencia?: number;  // ← Agregar
  cotizacion_monto?: number;  // ← Agregar
  tono?: string;
  audiencia?: string;
  contexto_adicional?: string;
  emisor_id: string;
  documentos_referencia_ids?: string[];
}