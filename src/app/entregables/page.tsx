'use client';

import { useQuery } from '@tanstack/react-query';
import { entregablesService } from '@/services/entregables';
import { Navbar } from '@/components/layouts/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, FileText } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import type { EntregableLight } from '@/types'; // 👈 Importa el tipo LIGHT

export default function EntregablesPage() {
  // 🔥 Usa el endpoint LIGHT
  const { data: entregables, isLoading } = useQuery<EntregableLight[]>({
    queryKey: ['entregables_light'],
    queryFn: () => entregablesService.getAllLight(),
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* HEADER */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Entregables</h1>
            <p className="text-gray-600">
              Gestiona todos tus documentos generados con IA
            </p>
          </div>

          <Link href="/entregables/nuevo">
            <Button size="lg" className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Nuevo Entregable
            </Button>
          </Link>
        </div>

        {/* TABLE */}
        <Card>
          <CardHeader>
            <CardTitle>Todos los Entregables</CardTitle>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              // 🟦 SKELETON LOADING
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : entregables && entregables.length > 0 ? (
              // 🟩 TABLE LISTA LIGHT
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Folio</TableHead>
                    <TableHead>Tema</TableHead>
                    <TableHead>Cuartillas</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Progreso</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {entregables.map((entregable: EntregableLight) => (
                    <TableRow key={entregable.id}>
                      <TableCell className="font-mono text-sm">
                        {entregable.folio}
                      </TableCell>

                      <TableCell className="font-medium">
                        {entregable.tema}
                      </TableCell>

                      <TableCell>
                        {entregable.cuartillas_solicitadas}
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={
                            entregable.estado === 'completado'
                              ? 'default'
                              : entregable.estado === 'en_proceso'
                              ? 'secondary'
                              : 'outline'
                          }
                        >
                          {entregable.estado}
                        </Badge>
                      </TableCell>

                      <TableCell>{entregable.progreso}%</TableCell>

                      <TableCell className="text-sm text-gray-600">
                        {entregable.fecha_solicitud 
                          ? new Date(entregable.fecha_solicitud).toLocaleDateString('es-MX')
                          : '—'}
                      </TableCell>


                      <TableCell className="text-right">
                        <Link href={`/entregables/${entregable.id}`}>
                          <Button variant="ghost" size="sm">
                            Ver Detalle
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              // ⛔ NO HAY
              <div className="py-12 text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium">No hay entregables</h3>
                <p className="mt-2 text-gray-600">
                  Crea tu primer entregable para comenzar
                </p>

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
