'use client';

import { useQuery } from '@tanstack/react-query';
import { entregablesService } from '@/services/entregables';
import { Navbar } from '@/components/layouts/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Clock, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage() {
  const { data: entregables, isLoading } = useQuery({
    queryKey: ['entregables'],
    queryFn: () => entregablesService.getAll({ limit: 10 }),
  });

  // Estadísticas
  const stats = {
    total: entregables?.length || 0,
    en_proceso: entregables?.filter((e) => e.estado === 'en_proceso').length || 0,
    completados: entregables?.filter((e) => e.estado === 'completado').length || 0,
    borradores: entregables?.filter((e) => e.estado === 'borrador').length || 0,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Bienvenido al sistema de generación de entregables con IA</p>
          </div>
          <Link href="/entregables/nuevo">
            <Button size="lg" className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Nuevo Entregable
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <FileText className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-gray-500">Entregables creados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">En Proceso</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.en_proceso}</div>
              <p className="text-xs text-gray-500">Generando contenido</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completados</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completados}</div>
              <p className="text-xs text-gray-500">Listos para descargar</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Borradores</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.borradores}</div>
              <p className="text-xs text-gray-500">Pendientes de aprobar</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Entregables */}
        <Card>
          <CardHeader>
            <CardTitle>Entregables Recientes</CardTitle>
            <CardDescription>Últimos 10 documentos creados</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-12 w-full" />
                  </div>
                ))}
              </div>
            ) : entregables && entregables.length > 0 ? (
              <div className="space-y-4">
                {entregables.map((entregable) => (
                  <Link
                    key={entregable.id}
                    href={`/entregables/${entregable.id}`}
                    className="block rounded-lg border p-4 transition hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{entregable.tema}</h3>
                          <Badge variant={
                            entregable.estado === 'completado' ? 'default' :
                            entregable.estado === 'en_proceso' ? 'secondary' :
                            'outline'
                          }>
                            {entregable.estado}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {entregable.folio} • {entregable.cuartillas_solicitadas} cuartillas
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{entregable.progreso_porcentaje}%</p>
                        <p className="text-xs text-gray-500">{entregable.etapa_actual}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium">No hay entregables</h3>
                <p className="mt-2 text-gray-600">Crea tu primer entregable para comenzar</p>
                <Link href="/entregables/nuevo">
                  <Button className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Entregable
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
