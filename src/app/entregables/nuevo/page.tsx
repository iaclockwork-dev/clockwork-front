'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { entregablesService } from '@/services/entregables';
import { emisoresService } from '@/services/emisores';
import { Navbar } from '@/components/layouts/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import Link from 'next/link';

export default function NuevoEntregablePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    tema: '',
    temario_descripcion: '', // ← Cambiado de "descripcion"
    cuartillas_solicitadas: 10,
    numero_documentos_referencia: 3, // ← Agregado
    cotizacion_monto: 0, // ← Agregado
    tono: 'profesional', // ← Agregado
    audiencia: 'general', // ← Agregado
    contexto_adicional: '', // ← Agregado
    emisor_id: '',
  });

  // Cargar emisores
  const { data: emisores, isLoading: loadingEmisores } = useQuery({
    queryKey: ['emisores'],
    queryFn: () => emisoresService.getAll(),
  });

  // Mutation para crear
  const createMutation = useMutation({
    mutationFn: (data: any) => entregablesService.create(data),
    onSuccess: (data) => {
      console.log('✅ Entregable creado:', data);
      router.push(`/entregables/${data.id}`);
    },
    onError: (error: any) => {
      console.error('❌ Error creando entregable:', error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📤 Enviando datos:', formData);
    createMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/entregables">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Entregables
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Crear Nuevo Entregable</h1>
          <p className="text-gray-600">Completa la información para generar tu documento con IA</p>
        </div>

        <div className="mx-auto max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Información del Entregable</CardTitle>
              <CardDescription>
                Proporciona los detalles del documento que deseas generar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Tema */}
                <div className="space-y-2">
                  <Label htmlFor="tema">Tema del Documento *</Label>
                  <Input
                    id="tema"
                    placeholder="Ej: Manual de Ciberseguridad Empresarial"
                    value={formData.tema}
                    onChange={(e) => setFormData({ ...formData, tema: e.target.value })}
                    required
                  />
                </div>

                {/* Descripción del Temario */}
                <div className="space-y-2">
                  <Label htmlFor="temario_descripcion">Descripción del Contenido *</Label>
                  <Textarea
                    id="temario_descripcion"
                    placeholder="Describe el contenido que necesitas, temas a cubrir, enfoque, etc."
                    rows={4}
                    value={formData.temario_descripcion}
                    onChange={(e) => setFormData({ ...formData, temario_descripcion: e.target.value })}
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Sé específico. Esta información ayudará a la IA a generar mejor contenido.
                  </p>
                </div>

                {/* Cuartillas */}
                <div className="space-y-2">
                  <Label htmlFor="cuartillas">Número de Cuartillas *</Label>
                  <Input
                    id="cuartillas"
                    type="number"
                    min="1"
                    max="400"
                    value={formData.cuartillas_solicitadas}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      cuartillas_solicitadas: parseInt(e.target.value) || 1
                    })}
                    required
                  />
                  <p className="text-xs text-gray-500">
                    1 cuartilla = ~250 palabras
                  </p>
                </div>

                {/* Documentos de Referencia */}
                <div className="space-y-2">
                  <Label htmlFor="num_docs">Documentos de Referencia</Label>
                  <Input
                    id="num_docs"
                    type="number"
                    min="0"
                    max="20"
                    value={formData.numero_documentos_referencia}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      numero_documentos_referencia: parseInt(e.target.value) || 0
                    })}
                  />
                  <p className="text-xs text-gray-500">
                    Cantidad de documentos que se usarán como referencia
                  </p>
                </div>

                {/* Tono */}
                <div className="space-y-2">
                  <Label htmlFor="tono">Tono del Documento *</Label>
                  <Select
                    value={formData.tono}
                    onValueChange={(value) => setFormData({ ...formData, tono: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="profesional">Profesional</SelectItem>
                      <SelectItem value="academico">Académico</SelectItem>
                      <SelectItem value="informal">Informal</SelectItem>
                      <SelectItem value="tecnico">Técnico</SelectItem>
                      <SelectItem value="ejecutivo">Ejecutivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Audiencia */}
                <div className="space-y-2">
                  <Label htmlFor="audiencia">Audiencia *</Label>
                  <Select
                    value={formData.audiencia}
                    onValueChange={(value) => setFormData({ ...formData, audiencia: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="tecnica">Técnica</SelectItem>
                      <SelectItem value="ejecutiva">Ejecutiva</SelectItem>
                      <SelectItem value="academica">Académica</SelectItem>
                      <SelectItem value="especializada">Especializada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Cotización (opcional - puedes calcularlo automáticamente) */}
                <div className="space-y-2">
                  <Label htmlFor="cotizacion">Monto de Cotización (opcional)</Label>
                  <Input
                    id="cotizacion"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.cotizacion_monto}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      cotizacion_monto: parseFloat(e.target.value) || 0
                    })}
                  />
                </div>

                {/* Contexto Adicional */}
                <div className="space-y-2">
                  <Label htmlFor="contexto">Contexto Adicional (opcional)</Label>
                  <Textarea
                    id="contexto"
                    placeholder="Información adicional que pueda ser útil..."
                    rows={3}
                    value={formData.contexto_adicional}
                    onChange={(e) => setFormData({ ...formData, contexto_adicional: e.target.value })}
                  />
                </div>

                {/* Emisor */}
                <div className="space-y-2">
                  <Label htmlFor="emisor">Cliente/Emisor *</Label>
                  <Select
                    value={formData.emisor_id}
                    onValueChange={(value) => {
                      console.log('Emisor seleccionado:', value);
                      setFormData({ ...formData, emisor_id: value });
                    }}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un emisor" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingEmisores ? (
                        <SelectItem value="loading" disabled>Cargando...</SelectItem>
                      ) : emisores?.length === 0 ? (
                        <SelectItem value="empty" disabled>No hay emisores disponibles</SelectItem>
                      ) : (
                        emisores?.map((emisor) => (
                          <SelectItem key={emisor.id} value={emisor.id.toString()}>
                            {emisor.nombre} {emisor.rfc && `(${emisor.rfc})`}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {emisores?.length === 0 && (
                    <p className="text-xs text-amber-600">
                      No hay emisores disponibles. <Link href="/emisores/nuevo" className="underline">Crear uno</Link>
                    </p>
                  )}
                </div>

                {/* Botones */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={createMutation.isPending || !formData.emisor_id}
                  >
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Crear Entregable
                      </>
                    )}
                  </Button>
                  <Link href="/entregables">
                    <Button type="button" variant="outline">
                      Cancelar
                    </Button>
                  </Link>
                </div>

                {createMutation.isError && (
                  <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
                    <p className="font-semibold">Error al crear el entregable</p>
                    <p className="mt-1">
                      {createMutation.error?.message || 'Por favor intenta nuevamente'}
                    </p>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}