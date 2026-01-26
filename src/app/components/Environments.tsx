// src/components/Ambientes.tsx
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Alert, AlertDescription } from "./ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { Search, Plus, MapPin, Users, Edit, Loader2, CheckCircle, XCircle, Building2, UserX, UserCheck } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface AmbienteData {
  id: string;
  nombre: string;
  codigo: string;
  capacidad: number;
  tipo: string;
  descripcion?: string;
  ubicacion?: string;
  is_active: boolean;
  created_at: string;
}

const tiposAmbiente = [
  { value: 'AULA', label: 'Aula', color: '#39A900' },
  { value: 'LABORATORIO', label: 'Laboratorio', color: '#00304D' },
  { value: 'TALLER', label: 'Taller', color: '#007832' },
  { value: 'AUDITORIO', label: 'Auditorio', color: '#71277A' },
  { value: 'SALA_COMPUTO', label: 'Sala de Cómputo', color: '#FDC300' },
  { value: 'BIBLIOTECA', label: 'Biblioteca', color: '#50E5F9' },
];

export function Environments() {
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [ambientes, setAmbientes] = useState<AmbienteData[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para modales
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Estados para operaciones
  const [operationLoading, setOperationLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  // Ambiente seleccionado
  const [selectedAmbiente, setSelectedAmbiente] = useState<AmbienteData | null>(null);

  // Formulario crear
  const [createFormData, setCreateFormData] = useState({
    nombre: '',
    codigo: '',
    capacidad: '',
    tipo: 'AULA',
    ubicacion: '',
  });

  // Formulario editar
  const [editFormData, setEditFormData] = useState({
    nombre: '',
    codigo: '',
    capacidad: '',
    tipo: 'AULA',
    descripcion: '',
    ubicacion: '',
    is_active: true,
  });

  // Cargar ambientes
  const fetchAmbientes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ambientes')
        .select('*')
        .order('nombre', { ascending: true });

      if (error) throw error;
      setAmbientes(data || []);
    } catch (error) {
      console.error('Error fetching ambientes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAmbientes();
  }, []);

  // ============================================
  // CREAR AMBIENTE
  // ============================================
  const handleCreateAmbiente = async (e: React.FormEvent) => {
    e.preventDefault();
    setOperationLoading(true);
    setResult(null);

    const capacidad = parseInt(createFormData.capacidad);
    if (isNaN(capacidad) || capacidad <= 0) {
      setResult({ success: false, message: 'La capacidad debe ser un número mayor a 0' });
      setOperationLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('create_ambiente', {
        p_nombre: createFormData.nombre,
        p_codigo: createFormData.codigo.toUpperCase(),
        p_capacidad: capacidad,
        p_tipo: createFormData.tipo,
        p_ubicacion: createFormData.ubicacion || null,
      });

      if (error) throw error;

      const response = typeof data === 'string' ? JSON.parse(data) : data;

      if (response.success) {
        setResult({ success: true, message: `Ambiente ${createFormData.nombre} creado exitosamente` });
        setCreateFormData({
          nombre: '', codigo: '', capacidad: '', tipo: 'AULA',
          ubicacion: '',
        });
        fetchAmbientes();
        setTimeout(() => {
          setCreateDialogOpen(false);
          setResult(null);
        }, 2000);
      } else {
        throw new Error(response.error || 'Error desconocido');
      }
    } catch (error: any) {
      setResult({ success: false, message: error.message || 'Error al crear ambiente' });
    } finally {
      setOperationLoading(false);
    }
  };

  // ============================================
  // EDITAR AMBIENTE
  // ============================================
  const openEditDialog = (ambiente: AmbienteData) => {
    setSelectedAmbiente(ambiente);
    setEditFormData({
      nombre: ambiente.nombre,
      codigo: ambiente.codigo,
      capacidad: ambiente.capacidad.toString(),
      tipo: ambiente.tipo,
      descripcion: ambiente.descripcion || '',
      ubicacion: ambiente.ubicacion || '',
      is_active: ambiente.is_active,
    });
    setEditDialogOpen(true);
    setResult(null);
  };

  const handleUpdateAmbiente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAmbiente) return;

    const capacidad = parseInt(editFormData.capacidad);
    if (isNaN(capacidad) || capacidad <= 0) {
      setResult({ success: false, message: 'La capacidad debe ser un número mayor a 0' });
      return;
    }

    setOperationLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.rpc('update_ambiente', {
        p_ambiente_id: selectedAmbiente.id,
        p_nombre: editFormData.nombre,
        p_codigo: editFormData.codigo.toUpperCase(),
        p_capacidad: capacidad,
        p_tipo: editFormData.tipo,
        p_descripcion: editFormData.descripcion || null,
        p_ubicacion: editFormData.ubicacion || null,
        p_is_active: editFormData.is_active,
      });

      if (error) throw error;

      const response = typeof data === 'string' ? JSON.parse(data) : data;

      if (response.success) {
        setResult({ success: true, message: 'Ambiente actualizado exitosamente' });
        fetchAmbientes();
        setTimeout(() => {
          setEditDialogOpen(false);
          setResult(null);
          setSelectedAmbiente(null);
        }, 2000);
      } else {
        throw new Error(response.error || 'Error desconocido');
      }
    } catch (error: any) {
      setResult({ success: false, message: error.message || 'Error al actualizar ambiente' });
    } finally {
      setOperationLoading(false);
    }
  };

  // ============================================
  // DESACTIVAR/ACTIVAR AMBIENTE
  // ============================================
  const openDeleteDialog = (ambiente: AmbienteData) => {
    setSelectedAmbiente(ambiente);
    setDeleteDialogOpen(true);
    setResult(null);
  };

  const handleToggleAmbienteStatus = async () => {
    if (!selectedAmbiente) return;

    setOperationLoading(true);

    try {
      const functionName = selectedAmbiente.is_active
        ? 'deactivate_ambiente'
        : 'activate_ambiente';

      const { data, error } = await supabase.rpc(functionName, {
        p_ambiente_id: selectedAmbiente.id,
      });

      if (error) throw error;

      const response = typeof data === 'string' ? JSON.parse(data) : data;

      if (response.success) {
        fetchAmbientes();
        setDeleteDialogOpen(false);
        setSelectedAmbiente(null);
      } else {
        throw new Error(response.error || 'Error desconocido');
      }
    } catch (error: any) {
      alert(error.message || 'Error al cambiar estado del ambiente');
    } finally {
      setOperationLoading(false);
    }
  };

  // ============================================
  // UTILIDADES
  // ============================================
  const filteredAmbientes = ambientes.filter(ambiente =>
    ambiente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ambiente.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ambiente.tipo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTipoColor = (tipo: string) => {
    const tipoData = tiposAmbiente.find(t => t.value === tipo);
    return tipoData?.color || "#000000";
  };

  const getTipoLabel = (tipo: string) => {
    const tipoData = tiposAmbiente.find(t => t.value === tipo);
    return tipoData?.label || tipo;
  };

  const stats = {
    total: ambientes.length,
    activos: ambientes.filter(a => a.is_active).length,
    capacidadTotal: ambientes.reduce((sum, a) => sum + a.capacidad, 0),
    tipos: new Set(ambientes.map(a => a.tipo)).size,
  };

  const canManageAmbientes = currentUser?.role === 'admin' || currentUser?.role === 'coordinador';

  return (
    <div className="min-h-screen relative">
      {/* Imagen de fondo MUY sutil */}
      <div
        className="fixed inset-0 bg-cover bg-center pointer-events-none"
        style={{
          backgroundImage: `url('/cai.jpg')`,
          filter: 'brightness(1.2)',
          opacity: '0.1'
        }}
      />

      {/* Contenido */}
      <div className="relative space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
     <img 
      src="/phias.png" 
      alt="PHIAS Logo" 
      className="h-12 w-auto relative z-10"
    />
            <h1 className="text-3xl font-bold text-[#00304D]">Ambientes</h1>
            </div>
            <p className="text-gray-600 mt-1">Gestión de espacios físicos del centro</p>
          </div>

          {canManageAmbientes && (
            <Dialog open={createDialogOpen} onOpenChange={(open) => {
              setCreateDialogOpen(open);
              if (!open) {
                // Limpiar formulario y resultados al cerrar
                setCreateFormData({
                  nombre: '',
                  codigo: '',
                  capacidad: '',
                  tipo: 'AULA',
                  ubicacion: '',
                });
                setResult(null);
              }
            }}>
              <DialogTrigger asChild>
                <Button className="bg-[#39A900] hover:bg-[#2d8000]">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Ambiente
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Ambiente</DialogTitle>
                  <DialogDescription>
                    Ingresa los datos del nuevo espacio físico
                  </DialogDescription>
                </DialogHeader>

                {result && (
                  <Alert variant={result.success ? 'default' : 'destructive'}>
                    {result.success ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                    <AlertDescription>{result.message}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleCreateAmbiente} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nombre">Nombre <span className="text-red-500">*</span></Label>
                      <Input
                        id="nombre"
                        placeholder="Aula 201"
                        value={createFormData.nombre}
                        onChange={(e) => setCreateFormData({ ...createFormData, nombre: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="codigo">Código <span className="text-red-500">*</span></Label>
                      <Input
                        id="codigo"
                        placeholder="A-201"
                        value={createFormData.codigo}
                        onChange={(e) => setCreateFormData({ ...createFormData, codigo: e.target.value.toUpperCase() })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tipo">Tipo <span className="text-red-500">*</span></Label>
                      <Select
                        value={createFormData.tipo}
                        onValueChange={(value) => setCreateFormData({ ...createFormData, tipo: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {tiposAmbiente.map(tipo => (
                            <SelectItem key={tipo.value} value={tipo.value}>
                              {tipo.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="capacidad">Capacidad <span className="text-red-500">*</span></Label>
                      <Input
                        id="capacidad"
                        type="number"
                        min="1"
                        placeholder="30"
                        value={createFormData.capacidad}
                        onChange={(e) => setCreateFormData({ ...createFormData, capacidad: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ubicacion">Ubicación</Label>
                    <Input
                      id="ubicacion"
                      placeholder="Edificio A - Piso 2"
                      value={createFormData.ubicacion}
                      onChange={(e) => setCreateFormData({ ...createFormData, ubicacion: e.target.value })}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#39A900] hover:bg-[#2d8000]"
                    disabled={operationLoading}
                  >
                    {operationLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creando ambiente...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Crear Ambiente
                      </>
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-[#39A900]">{stats.total}</div>
              <p className="text-sm text-gray-600">Total Ambientes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-[#00304D]">{stats.activos}</div>
              <p className="text-sm text-gray-600">Activos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-[#007832]">{stats.capacidadTotal}</div>
              <p className="text-sm text-gray-600">Capacidad Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-[#71277A]">{stats.tipos}</div>
              <p className="text-sm text-gray-600">Tipos de Espacios</p>
            </CardContent>
          </Card>
        </div>

        {/* Tipos Info */}
        <Card>
          <CardHeader>
            <CardTitle>Tipos de Ambientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {tiposAmbiente.map((tipo) => (
                <div key={tipo.value} className="p-4 border rounded-lg text-center">
                  <Building2 className="h-6 w-6 mx-auto mb-2" style={{ color: tipo.color }} />
                  <p className="font-medium text-sm text-[#00304D]">{tipo.label}</p>
                  <Badge style={{ backgroundColor: tipo.color }} className="mt-2">
                    {ambientes.filter(a => a.tipo === tipo.value).length}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ambientes Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Ambientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre, código o tipo..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" onClick={fetchAmbientes}>
                Actualizar
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-[#39A900]" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ambiente</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-center">Capacidad</TableHead>
                      <TableHead>Ubicación</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAmbientes.map((ambiente) => (
                      <TableRow key={ambiente.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-[#00304D]">{ambiente.nombre}</p>
                            <p className="text-sm text-gray-500">{ambiente.codigo}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge style={{ backgroundColor: getTipoColor(ambiente.tipo) }}>
                            {getTipoLabel(ambiente.tipo)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#39A900]/10">
                            <Users className="h-3 w-3 text-[#39A900]" />
                            <span className="text-sm font-medium text-[#39A900]">
                              {ambiente.capacidad}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {ambiente.ubicacion ? (
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <MapPin className="h-3 w-3" />
                              {ambiente.ubicacion}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">Sin ubicación</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={ambiente.is_active ? "bg-[#39A900]" : "bg-gray-500"}>
                            {ambiente.is_active ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {canManageAmbientes && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="Editar ambiente"
                                  onClick={() => openEditDialog(ambiente)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={ambiente.is_active ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"}
                                  title={ambiente.is_active ? "Desactivar" : "Activar"}
                                  onClick={() => openDeleteDialog(ambiente)}
                                >
                                  {ambiente.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal Editar */}
        <Dialog open={editDialogOpen} onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) {
            // Limpiar al cerrar
            setSelectedAmbiente(null);
            setResult(null);
          }
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Ambiente</DialogTitle>
              <DialogDescription>
                Modificar información de {selectedAmbiente?.nombre}
              </DialogDescription>
            </DialogHeader>

            {result && (
              <Alert variant={result.success ? 'default' : 'destructive'}>
                {result.success ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                <AlertDescription>{result.message}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleUpdateAmbiente} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-nombre">Nombre</Label>
                  <Input
                    id="edit-nombre"
                    value={editFormData.nombre}
                    onChange={(e) => setEditFormData({ ...editFormData, nombre: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-codigo">Código</Label>
                  <Input
                    id="edit-codigo"
                    value={editFormData.codigo}
                    onChange={(e) => setEditFormData({ ...editFormData, codigo: e.target.value.toUpperCase() })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-tipo">Tipo</Label>
                  <Select
                    value={editFormData.tipo}
                    onValueChange={(value) => setEditFormData({ ...editFormData, tipo: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposAmbiente.map(tipo => (
                        <SelectItem key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-capacidad">Capacidad</Label>
                  <Input
                    id="edit-capacidad"
                    type="number"
                    min="1"
                    value={editFormData.capacidad}
                    onChange={(e) => setEditFormData({ ...editFormData, capacidad: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-ubicacion">Ubicación</Label>
                <Input
                  id="edit-ubicacion"
                  value={editFormData.ubicacion}
                  onChange={(e) => setEditFormData({ ...editFormData, ubicacion: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-descripcion">Descripción</Label>
                <Textarea
                  id="edit-descripcion"
                  value={editFormData.descripcion}
                  onChange={(e) => setEditFormData({ ...editFormData, descripcion: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit-active"
                  checked={editFormData.is_active}
                  onChange={(e) => setEditFormData({ ...editFormData, is_active: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor="edit-active">Ambiente activo</Label>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-[#39A900] hover:bg-[#2d8000]"
                  disabled={operationLoading}
                >
                  {operationLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    'Guardar Cambios'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* AlertDialog Desactivar/Activar */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {selectedAmbiente?.is_active ? '¿Desactivar ambiente?' : '¿Activar ambiente?'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {selectedAmbiente?.is_active ? (
                  <>
                    ¿Estás seguro de desactivar <strong>{selectedAmbiente?.nombre}</strong>?
                    No se podrán asignar nuevos horarios en este ambiente.
                  </>
                ) : (
                  <>
                    ¿Estás seguro de activar <strong>{selectedAmbiente?.nombre}</strong>?
                    Se podrán asignar horarios nuevamente.
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleToggleAmbienteStatus}
                className={selectedAmbiente?.is_active ? "bg-red-600 hover:bg-red-700" : "bg-[#39A900] hover:bg-[#2d8000]"}
                disabled={operationLoading}
              >
                {operationLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  selectedAmbiente?.is_active ? 'Desactivar' : 'Activar'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}