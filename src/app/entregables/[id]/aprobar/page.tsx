'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { entregablesService } from '@/services/entregables';
import { Navbar } from '@/components/layouts/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AprobarEntregablePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [agentesSeleccionados, setAgentesSeleccionados] = useState<string[]>([]);

  // Cargar entregable
  const { data: entregable, isLoading } = useQuery({
    queryKey: ['entregable', id],
    queryFn: () => entregablesService.getById(id),
  });

  // Aprobar mutation
  const aprobarMutation = useMutation({
    mutationFn: (data: any) => entregablesService.aprobar(id, data),
    onSuccess: () => {
      // Iniciar generación
      generarMutation.mutate();
    },
  });

  // Generar mutation
  const generarMutation = useMutation({
    mutationFn: () => entregablesService.generar(id),
    onSuccess: () => {
      router.push(`/entregables/${id}`);
    },
  });

  const handleAprobar = () => {
    if (!entregable?.agentes_recomendados) return;

    // Si no hay seleccionados, usar todos
    const agentesAprobados = agentesSeleccionados.length > 0
      ? entregable.agentes_recomendados.filter(a => 
          agentesSeleccionados.includes(a.catalogo_agente_id)
        )
      : entregable.agentes_recomendados;

    aprobarMutation.mutate({
      agentes_aprobados: agentesAprobados,
    });
  };

  const toggleAgente = (agenteId: string) => {
    setAgentesSeleccionados(prev => 
      prev.includes(agenteId)
        ? prev.filter(id => id !== agenteId)
        : [...prev, agenteId]
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">Cargando...</div>
        </main>
      </div>
    );
  }

  if (!entregable || !entregable.agentes_recomendados) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold">No hay agentes para aprobar</h1>
            <Link href={`/entregables/${id}`}>
              <Button className="mt-4">Volver al Entregable</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const costoTotal = entregable.agentes_recomendados
    .filter(a => agentesSeleccionados.length === 0 || agentesSeleccionados.includes(a.catalogo_agente_id))
    .reduce((sum, a) => sum + a.costo_estimado, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href={`/entregables/${id}`}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Entregable
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Aprobar Temario y Agentes</h1>
          <p className="text-gray-600">Revisa y aprueba la configuración antes de generar el documento</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Temario */}
            <Card>
              <CardHeader>
                <CardTitle>Temario Aprobado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">Título:</h3>
                    <p>{entregable.temario_aprobado?.titulo_documento}</p>
                  </div>
                  {entregable.temario_aprobado?.secciones && (
                    <div>
                      <h3 className="font-semibold mb-2">Secciones:</h3>
                      <ol className="list-decimal list-inside space-y-1">
                        {entregable.temario_aprobado.secciones.map((seccion: any, idx: number) => (
                          <li key={idx}>{seccion.titulo}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Agentes */}
            <Card>
              <CardHeader>
                <CardTitle>Agentes Especializados</CardTitle>
                <CardDescription>
                  Selecciona los agentes que deseas utilizar (deja vacío para usar todos)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {entregable.agentes_recomendados.map((agente) => (
                    <div
                      key={agente.catalogo_agente_id}
                      className="flex items-start space-x-3 rounded-lg border p-4"
                    >
                      <Checkbox
                        id={agente.catalogo_agente_id}
                        checked={
                          agentesSeleccionados.length === 0 ||
                          agentesSeleccionados.includes(agente.catalogo_agente_id)
                        }
                        onCheckedChange={() => toggleAgente(agente.catalogo_agente_id)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{agente.icono}</span>
                            <div>
                              <label
                                htmlFor={agente.catalogo_agente_id}
                                className="font-semibold cursor-pointer"
                              >
                                {agente.nombre_display}
                              </label>
                              <p className="text-sm text-gray-600">
                                {agente.cuartillas_asignadas} cuartillas • Prioridad: {agente.prioridad}
                              </p>
                            </div>
                          </div>
                          <span className="font-semibold">${agente.costo_estimado.toFixed(2)}</span>
                        </div>
                        <p className="mt-2 text-sm text-gray-600">{agente.justificacion}</p>
                        {agente.tareas.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-medium text-gray-500">Tareas:</p>
                            <ul className="ml-4 list-disc text-sm text-gray-600">
                              {agente.tareas.slice(0, 3).map((tarea, idx) => (
                                <li key={idx}>{tarea}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Resumen */}
            <Card>
              <CardHeader>
                <CardTitle>Resumen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Tema</p>
                  <p className="font-semibold">{entregable.tema}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Cuartillas Requeridas</p>
                  <p className="text-2xl font-bold">{entregable.cuartillas_solicitadas}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Agentes Seleccionados</p>
                  <p className="text-2xl font-bold">
                    {agentesSeleccionados.length || entregable.agentes_recomendados.length}
                  </p>
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500">Costo Estimado</p>
                  <p className="text-3xl font-bold text-blue-600">
                    ${costoTotal.toFixed(2)} MXN
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Acción */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleAprobar}
                  disabled={aprobarMutation.isPending || generarMutation.isPending}
                >
                  {aprobarMutation.isPending || generarMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {aprobarMutation.isPending ? 'Aprobando...' : 'Iniciando generación...'}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Aprobar y Generar Documento
                    </>
                  )}
                </Button>
                <p className="mt-4 text-center text-xs text-blue-700">
                  La generación puede tardar varios minutos dependiendo de la cantidad de cuartillas
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}