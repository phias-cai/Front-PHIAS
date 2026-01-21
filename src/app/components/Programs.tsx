// src/components/Programs.tsx
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Alert, AlertDescription } from "./ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { Search, Plus, Award, Clock, Target, BookOpen, Loader2, CheckCircle, XCircle, Edit, UserX, UserCheck } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface ProgramaData {
  id: string;
  numero: string;
  nombre: string;
  tipo: string;
  duracion_meses: number;
  nivel?: string;
  version?: string;
  descripcion?: string;
  is_active: boolean;
  created_at: string;
  competencias_count?: number;
  resultados_count?: number;
}

const tiposFormacion = [
  { value: 'TECNICO', label: 'Técnico', color: '#39A900' },
  { value: 'TECNOLOGO', label: 'Tecnólogo', color: '#00304D' },
  { value: 'ESPECIALIZACION', label: 'Especialización', color: '#71277A' },
  { value: 'COMPLEMENTARIA', label: 'Complementaria', color: '#007832' },
  { value: 'OPERARIO', label: 'Operario', color: '#FDC300' },
];

export function Programs() {
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [programas, setProgramas] = useState<ProgramaData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para modales
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Estados para operaciones
  const [operationLoading, setOperationLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  
  // Programa seleccionado
  const [selectedPrograma, setSelectedPrograma] = useState<ProgramaData | null>(null);
  
  // Formulario crear
  const [createFormData, setCreateFormData] = useState({
    numero: '',
    nombre: '',
    tipo: 'TECNOLOGO',
    duracion_meses: '',
    version: '',
    descripcion: '',
  });

  // Formulario editar
  const [editFormData, setEditFormData] = useState({
    numero: '',
    nombre: '',
    tipo: 'TECNOLOGO',
    duracion_meses: '',
    nivel: '',
    version: '',
    descripcion: '',
  });

  // Cargar programas con estadÃ­sticas
  const fetchProgramas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('programas_stats')
        .select('*')
        .order('nombre', { ascending: true });

      if (error) throw error;
      setProgramas(data || []);
    } catch (error) {
      console.error('Error fetching programas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgramas();
  }, []);

  // ============================================
  // CREAR PROGRAMA
  // ============================================
  const handleCreatePrograma = async (e: React.FormEvent) => {
    e.preventDefault();
    setOperationLoading(true);
    setResult(null);

    const duracion = parseInt(createFormData.duracion_meses);
    if (isNaN(duracion) || duracion <= 0) {
      setResult({ success: false, message: 'La duración debe ser mayor a 0' });
      setOperationLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('create_programa', {
        p_numero: createFormData.numero,
        p_nombre: createFormData.nombre,
        p_tipo: createFormData.tipo,
        p_duracion_meses: duracion,
        p_version: createFormData.version || null,
        p_descripcion: createFormData.descripcion || null,
      });

      if (error) throw error;

      const response = typeof data === 'string' ? JSON.parse(data) : data;

      if (response.success) {
        setResult({ success: true, message: `Programa ${createFormData.nombre} creado exitosamente` });
        setCreateFormData({
          numero: '', nombre: '', tipo: 'TECNOLOGO', duracion_meses: '',
          version: '', descripcion: '',
        });
        fetchProgramas();
        setTimeout(() => {
          setCreateDialogOpen(false);
          setResult(null);
        }, 2000);
      } else {
        throw new Error(response.error || 'Error desconocido');
      }
    } catch (error: any) {
      setResult({ success: false, message: error.message || 'Error al crear programa' });
    } finally {
      setOperationLoading(false);
    }
  };

  // ============================================
  // EDITAR PROGRAMA
  // ============================================
  const openEditDialog = (programa: ProgramaData) => {
    setSelectedPrograma(programa);
    setEditFormData({
      numero: programa.numero,
      nombre: programa.nombre,
      tipo: programa.tipo,
      duracion_meses: programa.duracion_meses.toString(),
      nivel: programa.nivel || '',
      version: programa.version || '',
      descripcion: programa.descripcion || '',
    });
    setEditDialogOpen(true);
    setResult(null);
  };

  const handleUpdatePrograma = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPrograma) return;

    const duracion = parseInt(editFormData.duracion_meses);
    if (isNaN(duracion) || duracion <= 0) {
      setResult({ success: false, message: 'La duración debe ser mayor a 0' });
      return;
    }

    setOperationLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.rpc('update_programa', {
        p_programa_id: selectedPrograma.id,
        p_numero: editFormData.numero,
        p_nombre: editFormData.nombre,
        p_tipo: editFormData.tipo,
        p_duracion_meses: duracion,
        p_nivel: editFormData.nivel || null,
        p_version: editFormData.version || null,
        p_descripcion: editFormData.descripcion || null,
      });

      if (error) throw error;

      const response = typeof data === 'string' ? JSON.parse(data) : data;

      if (response.success) {
        setResult({ success: true, message: 'Programa actualizado exitosamente' });
        fetchProgramas();
        setTimeout(() => {
          setEditDialogOpen(false);
          setResult(null);
          setSelectedPrograma(null);
        }, 2000);
      } else {
        throw new Error(response.error || 'Error desconocido');
      }
    } catch (error: any) {
      setResult({ success: false, message: error.message || 'Error al actualizar programa' });
    } finally {
      setOperationLoading(false);
    }
  };

  // ============================================
  // DESACTIVAR/ACTIVAR PROGRAMA
  // ============================================
  const openDeleteDialog = (programa: ProgramaData) => {
    setSelectedPrograma(programa);
    setDeleteDialogOpen(true);
    setResult(null);
  };

  const handleToggleProgramaStatus = async () => {
    if (!selectedPrograma) return;

    setOperationLoading(true);

    try {
      const functionName = selectedPrograma.is_active 
        ? 'deactivate_programa' 
        : 'activate_programa';

      const { data, error } = await supabase.rpc(functionName, {
        p_programa_id: selectedPrograma.id,
      });

      if (error) throw error;

      const response = typeof data === 'string' ? JSON.parse(data) : data;

      if (response.success) {
        fetchProgramas();
        setDeleteDialogOpen(false);
        setSelectedPrograma(null);
      } else {
        throw new Error(response.error || 'Error desconocido');
      }
    } catch (error: any) {
      alert(error.message || 'Error al cambiar estado del programa');
    } finally {
      setOperationLoading(false);
    }
  };

  // ============================================
  // UTILIDADES
  // ============================================
  const getTipoColor = (tipo: string) => {
    const tipoData = tiposFormacion.find(t => t.value === tipo);
    return tipoData?.color || "#000000";
  };

  const getTipoLabel = (tipo: string) => {
    const tipoData = tiposFormacion.find(t => t.value === tipo);
    return tipoData?.label || tipo;
  };

  const categories = ["Todos", ...tiposFormacion.map(t => t.label)];

  const filteredPrograms = programas.filter(programa => {
    const matchesSearch = programa.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      programa.numero.includes(searchTerm);
    
    const matchesCategory = selectedCategory === "Todos" || 
      getTipoLabel(programa.tipo) === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const stats = {
    total: programas.length,
    activos: programas.filter(p => p.is_active).length,
    totalCompetencias: programas.reduce((sum, p) => sum + (p.competencias_count || 0), 0),
    totalResultados: programas.reduce((sum, p) => sum + (p.resultados_count || 0), 0),
  };

  const canManageProgramas = currentUser?.role === 'admin' || currentUser?.role === 'coordinador';

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
          <h1 className="text-3xl font-bold text-[#00304D]">Programas de Formación</h1>
          <p className="text-gray-600 mt-1">Gestión de programas y competencias</p>
        </div>
        
        {canManageProgramas && (
          <Dialog open={createDialogOpen} onOpenChange={(open) => {
            setCreateDialogOpen(open);
            if (!open) {
              // Limpiar formulario al cerrar
              setCreateFormData({
                numero: '',
                nombre: '',
                tipo: 'TECNOLOGO',
                duracion_meses: '',
                version: '',
                descripcion: '',
              });
              setResult(null);
            }
          }}>
            <DialogTrigger asChild>
              <Button className="bg-[#39A900] hover:bg-[#2d8000]">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Programa
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
              <DialogHeader className="flex-shrink-0">
                <DialogTitle>Crear Nuevo Programa</DialogTitle>
                <DialogDescription>
                  Ingresa los datos del nuevo programa de formación
                </DialogDescription>
              </DialogHeader>

              {result && (
                <Alert variant={result.success ? 'default' : 'destructive'} className="flex-shrink-0">
                  {result.success ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  <AlertDescription>{result.message}</AlertDescription>
                </Alert>
              )}

              <div className="flex-1 overflow-y-auto px-1">
                <form onSubmit={handleCreatePrograma} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="numero">Número SENA <span className="text-red-500">*</span></Label>
                    <Input
                      id="numero"
                      placeholder="228106"
                      value={createFormData.numero}
                      onChange={(e) => setCreateFormData({ ...createFormData, numero: e.target.value })}
                      required
                    />
                  </div>

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
                        {tiposFormacion.map(tipo => (
                          <SelectItem key={tipo.value} value={tipo.value}>
                            {tipo.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre del Programa <span className="text-red-500">*</span></Label>
                  <Input
                    id="nombre"
                    placeholder="Análisis y Desarrollo de Software"
                    value={createFormData.nombre}
                    onChange={(e) => setCreateFormData({ ...createFormData, nombre: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duracion">Duración (meses) <span className="text-red-500">*</span></Label>
                    <Input
                      id="duracion"
                      type="number"
                      min="1"
                      placeholder="24"
                      value={createFormData.duracion_meses}
                      onChange={(e) => setCreateFormData({ ...createFormData, duracion_meses: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="version">Versión</Label>
                    <Input
                      id="version"
                      placeholder="V1"
                      value={createFormData.version}
                      onChange={(e) => setCreateFormData({ ...createFormData, version: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    placeholder="Descripción del programa..."
                    value={createFormData.descripcion}
                    onChange={(e) => setCreateFormData({ ...createFormData, descripcion: e.target.value })}
                    rows={3}
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
                      Creando programa...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Crear Programa
                    </>
                  )}
                </Button>
              </form>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-[#39A900]">{stats.total}</div>
            <p className="text-sm text-gray-600">Programas Activos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-[#00304D]">{stats.totalCompetencias}</div>
            <p className="text-sm text-gray-600">Total Competencias</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-[#007832]">{stats.totalResultados}</div>
            <p className="text-sm text-gray-600">Resultados de Aprendizaje</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-[#71277A]">{stats.activos}</div>
            <p className="text-sm text-gray-600">Programas Activos</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre o cÃ³digo de programa..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category ? "bg-[#39A900] hover:bg-[#2d8000]" : ""}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Programs Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-[#39A900]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrograms.map((program) => (
            <Card 
              key={program.id} 
              className="hover:shadow-lg transition-shadow border-t-4" 
              style={{ borderTopColor: getTipoColor(program.tipo) }}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg text-[#00304D] mb-2">{program.nombre}</CardTitle>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        CÃ³digo: {program.numero}
                      </Badge>
                      <Badge className="text-xs" style={{ backgroundColor: getTipoColor(program.tipo) }}>
                        {getTipoLabel(program.tipo)}
                      </Badge>
                      {!program.is_active && (
                        <Badge className="text-xs bg-gray-500">
                          Inactivo
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Award className="h-8 w-8" style={{ color: getTipoColor(program.tipo) }} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#39A900]" />
                    <div>
                      <p className="text-xs text-gray-500">Duración</p>
                      <p className="text-sm font-medium text-[#00304D]">{program.duracion_meses} meses</p>
                    </div>
                  </div>
                  {program.nivel && (
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-[#39A900]" />
                      <div>
                        <p className="text-xs text-gray-500">Nivel</p>
                        <p className="text-sm font-medium text-[#00304D]">{program.nivel}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Competencias</span>
                    <span className="text-sm font-medium text-[#39A900]">{program.competencias_count || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Resultados de Aprendizaje</span>
                    <span className="text-sm font-medium text-[#00304D]">{program.resultados_count || 0}</span>
                  </div>
                </div>

                {canManageProgramas && (
                  <div className="pt-4 border-t flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1" 
                      size="sm"
                      onClick={() => openEditDialog(program)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                    <Button 
                      className="flex-1 bg-[#39A900] hover:bg-[#2d8000]" 
                      size="sm"
                    >
                      <Target className="h-3 w-3 mr-1" />
                      Competencias
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className={program.is_active ? "text-red-600" : "text-green-600"}
                      onClick={() => openDeleteDialog(program)}
                    >
                      {program.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Editar */}
      <Dialog open={editDialogOpen} onOpenChange={(open) => {
        setEditDialogOpen(open);
        if (!open) {
          setSelectedPrograma(null);
          setResult(null);
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Programa</DialogTitle>
            <DialogDescription>
              Modificar información de {selectedPrograma?.nombre}
            </DialogDescription>
          </DialogHeader>

          {result && (
            <Alert variant={result.success ? 'default' : 'destructive'}>
              {result.success ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleUpdatePrograma} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-numero">Número SENA</Label>
                <Input
                  id="edit-numero"
                  value={editFormData.numero}
                  onChange={(e) => setEditFormData({ ...editFormData, numero: e.target.value })}
                  required
                />
              </div>

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
                    {tiposFormacion.map(tipo => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-nombre">Nombre del Programa</Label>
              <Input
                id="edit-nombre"
                value={editFormData.nombre}
                onChange={(e) => setEditFormData({ ...editFormData, nombre: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-duracion">Duración (meses)</Label>
                <Input
                  id="edit-duracion"
                  type="number"
                  min="1"
                  value={editFormData.duracion_meses}
                  onChange={(e) => setEditFormData({ ...editFormData, duracion_meses: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-nivel">Nivel</Label>
                <Input
                  id="edit-nivel"
                  value={editFormData.nivel}
                  onChange={(e) => setEditFormData({ ...editFormData, nivel: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-version">Versión</Label>
                <Input
                  id="edit-version"
                  value={editFormData.version}
                  onChange={(e) => setEditFormData({ ...editFormData, version: e.target.value })}
                />
              </div>
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
              {selectedPrograma?.is_active ? '¿Desactivar programa?' : '¿Activar programa?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedPrograma?.is_active ? (
                <>
                  ¿Estás seguro de desactivar <strong>{selectedPrograma?.nombre}</strong>? 
                  No se podrán crear nuevas fichas para este programa.
                </>
              ) : (
                <>
                  ¿Estás seguro de activar <strong>{selectedPrograma?.nombre}</strong>?
                  Se podrán crear fichas nuevamente.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggleProgramaStatus}
              className={selectedPrograma?.is_active ? "bg-red-600 hover:bg-red-700" : "bg-[#39A900] hover:bg-[#2d8000]"}
              disabled={operationLoading}
            >
              {operationLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                selectedPrograma?.is_active ? 'Desactivar' : 'Activar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </div>
  )
}