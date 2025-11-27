'use client';

import { useQuery } from '@tanstack/react-query';
import { agentesService } from '@/services/agentes';
import { Navbar } from '@/components/layouts/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AgentesPage() {
  const { data: agentes, isLoading } = useQuery({
    queryKey: ['agentes'],
    queryFn: () => agentesService.getCatalogo({ estado: 'ACTIVO' }),
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Catálogo de Agentes IA</h1>
          <p className="text-gray-600">
            Agentes especializados disponibles para generar tu contenido
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        ) : agentes && agentes.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {agentes.map((agente) => (
              <Card key={agente.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{agente.icono}</span>
                      <div>
                        <CardTitle className="text-lg">{agente.nombre_display}</CardTitle>
                        <CardDescription>{agente.tipo}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline">{agente.estado}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">{agente.descripcion}</p>
                  
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2">Especialidad:</p>
                    <p className="text-sm">{agente.especialidad}</p>
                  </div>

                  {agente.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {agente.tags.map((tag, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Costo por cuartilla</span>
                      <span className="text-lg font-bold text-blue-600">
                        ${agente.costo_por_cuartilla.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium">No hay agentes disponibles</h3>
            <p className="mt-2 text-gray-600">Los agentes se cargarán pronto</p>
          </div>
        )}
      </main>
    </div>
  );
}