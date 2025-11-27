'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { entregablesService } from '@/services/entregables';
import { Navbar } from '@/components/layouts/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, FileText, Sparkles, Users, Play, Download, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

export default function EntregableDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;

  // Estado para guardar agentes recomendados temporalmente
  const [agentesRecomendados, setAgentesRecomendados] = useState<any[]>([]);

  console.log('🔍 ID del entregable:', id);

  // Cargar entregable
  const { data: entregableRaw, isLoading } = useQuery({
    queryKey: ['entregable', id],
    queryFn: () => entregablesService.getById(id),

    // ⛔️ Antes solo refrescabas mientras estado == en_proceso
    // ✅ Ahora refrescamos también hasta que llegue documento_final_id
    refetchInterval: (query) => {
      const data = query.state.data;

      if (!data) return 3000;

      const estado = (data.estado || '').toLowerCase();

      if (estado === 'en_proceso') return 3000;
      if (estado === 'completado' && !data.documento_final_id) return 3000;

      return false;
    },
  });

  // 🔧 Normalizar objeto para evitar errores
  const entregable = entregableRaw
    ? { ...entregableRaw, estado: (entregableRaw.estado || '').toLowerCase() }
    : null;

  console.log('📦 Entregable normalizado:', entregable);
  console.log('📄 Documento final ID:', entregable?.documento_final_id);

  const formatFecha = (fecha?: string) => {
    if (!fecha) return 'N/A';
    try {
      return new Date(fecha).toLocaleDateString('es-MX');
    } catch {
      return 'N/A';
    }
  };

  // Generar temario
  const generarTemarioMutation = useMutation({
    mutationFn: () => entregablesService.generarTemario(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['entregable', id] }),
  });

  // Recomendar agentes
  const recomendarAgentesMutation = useMutation({
    mutationFn: () => entregablesService.recomendarAgentes(id),
    onSuccess: (data) => {
      setAgentesRecomendados(data.agentes_recomendados || []);
      queryClient.invalidateQueries({ queryKey: ['entregable', id] });
    },
  });

  // Aprobar agentes
  const aprobarAgentesMutation = useMutation({
    mutationFn: async () => {
      return entregablesService.aprobar(id, {
        temario_aprobado: entregable?.temario_aprobado || entregable?.temario_sugerido,
        agentes_aprobados: agentesRecomendados,
      });
    },
    onSuccess: () => {
      setAgentesRecomendados([]);
      queryClient.invalidateQueries({ queryKey: ['entregable', id] });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Skeleton className="mb-8 h-32 w-full" />
          <Skeleton className="h-96 w-full" />
        </main>
      </div>
    );
  }

  if (!entregable) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Entregable no encontrado</h1>
            <Link href="/entregables">
              <Button className="mt-4">Volver a Entregables</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Determinar agentes
  const agentesParaMostrar =
    entregable.agentes_asignados && entregable.agentes_asignados.length > 0
      ? entregable.agentes_asignados
      : agentesRecomendados;

  const hayAgentesRecomendadosSinAprobar =
    agentesRecomendados.length > 0 &&
    (!entregable.agentes_asignados || entregable.agentes_asignados.length === 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* HEADER */}
        <div className="mb-8">
          <Link href="/entregables">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Entregables
            </Button>
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">{entregable.tema}</h1>
              <p className="text-gray-600">{entregable.folio}</p>
            </div>

            <Badge
              variant={
                entregable.estado === 'completado'
                  ? 'default'
                  : entregable.estado === 'en_proceso'
                  ? 'secondary'
                  : 'outline'
              }
              className="text-base px-4 py-2"
            >
              {entregable.estado}
            </Badge>
          </div>
        </div>

        {/* PROGRESS */}
        {entregable.estado === 'en_proceso' && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-blue-900">
                    Generando documento...
                  </span>
                  <span className="text-sm text-blue-700">
                    {entregable.progreso_porcentaje}%
                  </span>
                </div>
                <Progress value={entregable.progreso_porcentaje} className="h-2" />
                <p className="text-sm text-blue-700">
                  Etapa: {entregable.etapa_actual}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* MAIN */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="info" className="space-y-4">
              <TabsList>
                <TabsTrigger value="info">Información</TabsTrigger>
                <TabsTrigger value="temario">Temario</TabsTrigger>
                <TabsTrigger value="agentes">
                  Agentes {agentesParaMostrar.length > 0 && `(${agentesParaMostrar.length})`}
                </TabsTrigger>
              </TabsList>

              {/* -------- INFO TAB -------- */}

              <TabsContent value="info">
                <Card>
                  <CardHeader>
                    <CardTitle>Detalles del Entregable</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Descripción
                      </p>
                      <p className="mt-1">
                        {entregable.temario_descripcion || 'Sin descripción'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Cuartillas
                        </p>
                        <p className="mt-1 text-lg font-semibold">
                          {entregable.cuartillas_solicitadas}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Fecha de Solicitud
                        </p>
                        <p className="mt-1">{formatFecha(entregable.fecha_solicitud)}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Tono</p>
                        <p className="mt-1 capitalize">
                          {entregable.tono || 'N/A'}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Audiencia
                        </p>
                        <p className="mt-1 capitalize">
                          {entregable.audiencia || 'General'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* -------- TEMARIO TAB -------- */}

              <TabsContent value="temario">
                <Card>
                  <CardHeader>
                    <CardTitle>Temario Generado por IA</CardTitle>
                    <CardDescription>
                      {entregable.temario_aprobado
                        ? 'Temario aprobado'
                        : entregable.temario_sugerido
                        ? 'Temario generado - Revisa y aprueba'
                        : 'Genera el temario con IA'}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    {(entregable.temario_sugerido || entregable.temario_aprobado) ? (
                      <div className="space-y-4">
                        {(() => {
                          const temario =
                            entregable.temario_aprobado ||
                            entregable.temario_sugerido;

                          return (
                            <>
                              <div>
                                <h3 className="font-semibold">Título:</h3>
                                <p>{temario.titulo_documento}</p>
                              </div>

                              {temario.resumen_ejecutivo && (
                                <div>
                                  <h3 className="font-semibold">
                                    Resumen Ejecutivo:
                                  </h3>
                                  <p className="text-sm text-gray-600">
                                    {temario.resumen_ejecutivo}
                                  </p>
                                </div>
                              )}

                              {temario.secciones && (
                                <div>
                                  <h3 className="font-semibold mb-2">
                                    Secciones:
                                  </h3>
                                  <ol className="list-decimal list-inside space-y-2">
                                    {temario.secciones.map(
                                      (seccion: any, idx: number) => (
                                        <li key={idx} className="text-sm">
                                          <strong>{seccion.titulo}</strong>
                                          {seccion.cuartillas_estimadas && (
                                            <span className="text-gray-500 ml-2">
                                              ({seccion.cuartillas_estimadas}{' '}
                                              cuartillas)
                                            </span>
                                          )}
                                        </li>
                                      )
                                    )}
                                  </ol>
                                </div>
                              )}

                              {!entregable.temario_aprobado &&
                                entregable.temario_sugerido && (
                                  <div className="pt-4 border-t">
                                    <Button
                                      onClick={async () => {
                                        try {
                                          await entregablesService.aprobar(id, {
                                            temario_aprobado:
                                              entregable.temario_sugerido,
                                            agentes_aprobados: [],
                                          });
                                          queryClient.invalidateQueries({
                                            queryKey: ['entregable', id],
                                          });
                                        } catch (error) {
                                          console.error(
                                            'Error aprobando temario:',
                                            error
                                          );
                                        }
                                      }}
                                      className="w-full"
                                    >
                                      ✓ Aprobar Temario
                                    </Button>
                                  </div>
                                )}

                              {entregable.temario_aprobado && (
                                <div className="pt-4 border-t">
                                  <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
                                    <span className="text-xl">✓</span>
                                    <span className="font-medium">
                                      Temario aprobado
                                    </span>
                                  </div>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-4 text-gray-600">
                          El temario aún no ha sido generado
                        </p>
                        <Button
                          className="mt-4"
                          onClick={() => generarTemarioMutation.mutate()}
                          disabled={generarTemarioMutation.isPending}
                        >
                          {generarTemarioMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Generando...
                            </>
                          ) : (
                            <>
                              <Sparkles className="mr-2 h-4 w-4" />
                              Generar Temario con IA
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* -------- AGENTES TAB -------- */}

              <TabsContent value="agentes">
                <Card>
                  <CardHeader>
                    <CardTitle>Agentes Especializados</CardTitle>
                    <CardDescription>
                      {agentesParaMostrar.length > 0
                        ? hayAgentesRecomendadosSinAprobar
                          ? `${agentesParaMostrar.length} agente(s) recomendado(s) - Revisa y aprueba`
                          : `${agentesParaMostrar.length} agente(s) asignado(s)`
                        : 'Genera recomendaciones de agentes'}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    {agentesParaMostrar.length > 0 ? (
                      <div className="space-y-4">
                        {agentesParaMostrar.map((agente: any, idx: number) => (
                          <div key={agente.id || idx} className="rounded-lg border p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">{agente.icono || '📄'}</span>
                                <div>
                                  <h4 className="font-semibold">
                                    {agente.nombre_display}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    {agente.cuartillas_asignadas} cuartillas
                                  </p>
                                </div>
                              </div>

                              <Badge
                                variant={
                                  agente.estado === 'APROBADO'
                                    ? 'default'
                                    : 'secondary'
                                }
                              >
                                {agente.estado || 'RECOMENDADO'}
                              </Badge>
                            </div>

                            {agente.justificacion && (
                              <p className="mt-2 text-sm text-gray-600">
                                <strong>Por qué:</strong> {agente.justificacion}
                              </p>
                            )}

                            {agente.seccion_documento && (
                              <p className="mt-2 text-sm text-gray-600">
                                <strong>Sección:</strong>{' '}
                                {agente.seccion_documento}
                              </p>
                            )}

                            {agente.tareas && agente.tareas.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs font-medium text-gray-500">
                                  Tareas:
                                </p>
                                <ul className="mt-1 list-disc list-inside text-xs text-gray-600">
                                  {agente.tareas.map(
                                    (tarea: string, i: number) => (
                                      <li key={i}>{tarea}</li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}

                            {agente.costo_estimado && (
                              <p className="mt-2 text-xs text-gray-500">
                                Costo estimado: $
                                {agente.costo_estimado.toFixed(2)} MXN
                              </p>
                            )}
                          </div>
                        ))}

                        {hayAgentesRecomendadosSinAprobar && (
                          <div className="pt-4 border-t">
                            <Button
                              onClick={() => aprobarAgentesMutation.mutate()}
                              disabled={aprobarAgentesMutation.isPending}
                              className="w-full"
                            >
                              {aprobarAgentesMutation.isPending
                                ? 'Aprobando...'
                                : '✓ Aprobar Agentes'}
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Users className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-4 text-gray-600">
                          Los agentes aún no han sido recomendados
                        </p>
                        <Button
                          className="mt-4"
                          onClick={() => recomendarAgentesMutation.mutate()}
                          disabled={
                            recomendarAgentesMutation.isPending ||
                            !entregable.temario_aprobado
                          }
                        >
                          {recomendarAgentesMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Recomendando...
                            </>
                          ) : (
                            <>
                              <Sparkles className="mr-2 h-4 w-4" />
                              Recomendar Agentes con IA
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* -------- SIDEBAR -------- */}

          <div className="space-y-6">
            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Acciones</CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">

                {/* GENERAR DOCUMENTO */}
                {entregable.temario_aprobado &&
                entregable.agentes_asignados &&
                entregable.agentes_asignados.length > 0 && (
                  <Button
                    className="w-full"
                    onClick={async () => {
                      try {
                        await entregablesService.generar(id);
                        queryClient.invalidateQueries({
                          queryKey: ['entregable', id],
                        });
                      } catch (error) {
                        console.error('Error generando documento:', error);
                      }
                    }}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Generar Documento
                  </Button>
                )}

                {/* FALTAN AGENTES */}
                {entregable.temario_aprobado &&
                  (!entregable.agentes_asignados ||
                    entregable.agentes_asignados.length === 0) && (
                    <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                      ⚠️ Faltan agentes por aprobar.
                    </div>
                  )}

                {/* TEMARIO NO APROBADO */}
                {!entregable.temario_aprobado && (
                  <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                    ℹ️ Primero genera y aprueba el temario.
                  </div>
                )}

                {/* DESCARGAR DOCUMENTO */}
                  {!!entregable.documento_final_url ? (
                    <Button
                        className="w-full"
                        variant="outline"
                        onClick={() => entregablesService.descargarDocumento(entregable.documento_final_url)}
                    >
                        <Download className="mr-2 h-4 w-4" />
                        Descargar Documento
                    </Button>
                    ) : (
                    <div className="text-sm text-gray-600 bg-gray-100 p-3 rounded-lg">
                        No hay documento final generado aún.
                    </div>
                    )}


              </CardContent>
            </Card>

            {/* STATS */}
            <Card>
              <CardHeader>
                <CardTitle>Estadísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Progreso</p>
                  <p className="text-2xl font-bold">
                    {entregable.progreso_porcentaje || 0}%
                  </p>
                </div>

                {(entregable.agentes_asignados?.length ||
                  agentesRecomendados.length) > 0 && (
                  <div>
                    <p className="text-sm text-gray-500">Agentes</p>
                    <p className="text-2xl font-bold">
                      {entregable.agentes_asignados?.length ||
                        agentesRecomendados.length}
                    </p>
                  </div>
                )}

                {entregable.total_tokens_utilizados &&
                  entregable.total_tokens_utilizados > 0 && (
                    <div>
                      <p className="text-sm text-gray-500">Tokens Utilizados</p>
                      <p className="text-lg font-semibold">
                        {entregable.total_tokens_utilizados.toLocaleString()}
                      </p>
                    </div>
                  )}

                {entregable.costo_real_tokens &&
                  entregable.costo_real_tokens > 0 && (
                    <div>
                      <p className="text-sm text-gray-500">Costo Real</p>
                      <p className="text-lg font-semibold">
                        ${entregable.costo_real_tokens.toFixed(2)} MXN
                      </p>
                    </div>
                  )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
