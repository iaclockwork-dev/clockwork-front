'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { emisoresService } from '@/services/emisores';
import { Navbar } from '@/components/layouts/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Building2, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function EmisoresPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    razon_social: '',
    rfc: '',
    email: '',
    telefono: '',
    direccion: '',
  });

  // Cargar emisores
  const { data: emisores, isLoading } = useQuery({
    queryKey: ['emisores'],
    queryFn: () => emisoresService.getAll(),
  });

  // Crear emisor
  const createMutation = useMutation({
    mutationFn: (data: any) => emisoresService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emisores'] });
      setIsDialogOpen(false);
      setFormData({
        nombre: '',
        razon_social: '',
        rfc: '',
        email: '',
        telefono: '',
        direccion: '',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Emisores / Clientes</h1>
            <p className="text-gray-600">Gestiona los clientes que solicitan entregables</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Nuevo Emisor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Emisor</DialogTitle>
                <DialogDescription>
                  Completa la información del cliente
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Nombre */}
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre Comercial *</Label>
                    <Input
                      id="nombre"
                      placeholder="Ej: Empresa Test"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      required
                    />
                  </div>

                  {/* RFC */}
                  <div className="space-y-2">
                    <Label htmlFor="rfc">RFC *</Label>
                    <Input
                      id="rfc"
                      placeholder="ETS210526ABC"
                      value={formData.rfc}
                      onChange={(e) => setFormData({ ...formData, rfc: e.target.value.toUpperCase() })}
                      maxLength={13}
                      required
                    />
                  </div>
                </div>

                {/* Razón Social */}
                <div className="space-y-2">
                  <Label htmlFor="razon_social">Razón Social *</Label>
                  <Input
                    id="razon_social"
                    placeholder="Empresa Test Sociedad Anónima"
                    value={formData.razon_social}
                    onChange={(e) => setFormData({ ...formData, razon_social: e.target.value })}
                    required
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="contacto@empresa.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  {/* Teléfono */}
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      placeholder="+52 55 1234 5678"
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    />
                  </div>
                </div>

                {/* Dirección */}
                <div className="space-y-2">
                  <Label htmlFor="direccion">Dirección</Label>
                  <Textarea
                    id="direccion"
                    placeholder="Calle, Número, Colonia, Ciudad"
                    rows={2}
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  />
                </div>

                {/* Botones */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creando...
                      </>
                    ) : (
                      'Crear Emisor'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                </div>

                {createMutation.isError && (
                  <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
                    Error al crear el emisor. Verifica que el RFC sea único.
                  </div>
                )}
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Todos los Emisores</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : emisores && emisores.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>RFC</TableHead>
                    <TableHead>Razón Social</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Teléfono</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {emisores.map((emisor) => (
                    <TableRow key={emisor.id}>
                      <TableCell className="font-medium">{emisor.nombre}</TableCell>
                      <TableCell className="font-mono text-sm">{emisor.rfc}</TableCell>
                      <TableCell>{emisor.razon_social}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {emisor.email || '-'}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {emisor.telefono || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-12 text-center">
                <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium">No hay emisores</h3>
                <p className="mt-2 text-gray-600">Crea tu primer emisor para comenzar</p>
                <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Emisor
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}