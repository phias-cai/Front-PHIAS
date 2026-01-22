// src/components/Fichas.tsx
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Alert, AlertDescription } from "./ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { Search, Plus, Users, Calendar, BookOpen, Loader2, CheckCircle, XCircle, Edit, UserX, UserCheck, Clock } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface FichaData {
  id: string;
  numero: string;
  jornada: string;
  fecha_inicio: string;
  fecha_fin: string;
  cantidad_aprendices: number;
  gestor_ficha?: string;
  coordinador_id?: string;
  is_active: boolean;
  programa_id: string;
  programa_nombre?: string;
  programa_codigo?: string;
  programa_tipo?: string;
  estado?: string;
  created_at: string;
}

interface ProgramaOption {
  id: string;
  numero: string;
  nombre: string;
  tipo: string;
}

interface InstructorOption {
  id: string;
  nombres: string;
  documento?: string;
  area?: string;
}

const jornadas = [
  { value: 'DIURNA', label: 'Diurna', color: '#FDC300' },
  { value: 'NOCTURNA', label: 'Nocturna', color: '#00304D' },
  { value: 'MIXTA', label: 'Mixta', color: '#71277A' },
  { value: 'FINES_DE_SEMANA', label: 'Fines de Semana', color: '#007832' },
];

interface FichasProps {
  onNavigate?: (view: string, data?: any) => void;
}

export function Fichas({ onNavigate }: FichasProps) {
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJornada, setSelectedJornada] = useState("Todos");
  const [fichas, setFichas] = useState<FichaData[]>([]);
  const [programas, setProgramas] = useState<ProgramaOption[]>([]);
  const [instructores, setInstructores] = useState<InstructorOption[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para modales
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Estados para operaciones
  const [operationLoading, setOperationLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  
  // Ficha seleccionada
  const [selectedFicha, setSelectedFicha] = useState<FichaData | null>(null);
  
  // Formulario crear
  const [createFormData, setCreateFormData] = useState({
    numero: '',
    programa_id: '',
    jornada: 'DIURNA',
    fecha_inicio: '',
    fecha_fin: '',
    cantidad_aprendices: '',
    coordinador_id: '', // ID del instructor seleccionado
  });

  // Formulario editar
  const [editFormData, setEditFormData] = useState({
    numero: '',
    programa_id: '',
    jornada: 'DIURNA',
    fecha_inicio: '',
    fecha_fin: '',
    cantidad_aprendices: '',
    coordinador_id: '', // ID del instructor seleccionado
  });

  // Cargar fichas con estadísticas
  const fetchFichas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('fichas_stats')
        .select('*')
        .order('fecha_inicio', { ascending: false });

      if (error) throw error;
      setFichas(data || []);
    } catch (error) {
      console.error('Error fetching fichas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar programas activos para el selector
  const fetchProgramas = async () => {
    try {
      const { data, error } = await supabase
        .from('programas')
        .select('id, numero, nombre, tipo')
        .eq('is_active', true)
        .order('nombre', { ascending: true });

      if (error) throw error;
      setProgramas(data || []);
    } catch (error) {
      console.error('Error fetching programas:', error);
    }
  };

  // Cargar instructores activos para el selector
  const fetchInstructores = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nombres, documento, area')
        .eq('rol', 'instructor')
        .eq('is_active', true)
        .order('nombres', { ascending: true });

      if (error) throw error;
      setInstructores(data || []);
    } catch (error) {
      console.error('Error fetching instructores:', error);
    }
  };

  useEffect(() => {
    fetchFichas();
    fetchProgramas();
    fetchInstructores();
  }, []);

  // ============================================
  // CREAR FICHA
  // ============================================
  const handleCreateFicha = async (e: React.FormEvent) => {
    e.preventDefault();
    setOperationLoading(true);
    setResult(null);

    const cantidad = parseInt(createFormData.cantidad_aprendices);
    if (isNaN(cantidad) || cantidad <= 0) {
      setResult({ success: false, message: 'La cantidad de aprendices debe ser mayor a 0' });
      setOperationLoading(false);
      return;
    }

    // Obtener nombre del instructor seleccionado
    const instructorSeleccionado = instructores.find(i => i.id === createFormData.coordinador_id);
    const nombreGestor = instructorSeleccionado?.nombres || null;

    try {
      const { data, error } = await supabase.rpc('create_ficha', {
        p_numero: createFormData.numero,
        p_programa_id: createFormData.programa_id,
        p_jornada: createFormData.jornada,
        p_fecha_inicio: createFormData.fecha_inicio,
        p_fecha_fin: createFormData.fecha_fin,
        p_cantidad_aprendices: cantidad,
        p_gestor_ficha: nombreGestor,
        p_coordinador_id: createFormData.coordinador_id || null,
      });

      if (error) throw error;

      const response = typeof data === 'string' ? JSON.parse(data) : data;

      if (response.success) {
        setResult({ success: true, message: `Ficha ${createFormData.numero} creada exitosamente` });
        setCreateFormData({
          numero: '', programa_id: '', jornada: 'DIURNA',
          fecha_inicio: '', fecha_fin: '', cantidad_aprendices: '', coordinador_id: '',
        });
        fetchFichas();
        setTimeout(() => {
          setCreateDialogOpen(false);
          setResult(null);
        }, 2000);
      } else {
        throw new Error(response.error || 'Error desconocido');
      }
    } catch (error: any) {
      setResult({ success: false, message: error.message || 'Error al crear ficha' });
    } finally {
      setOperationLoading(false);
    }
  };

  // ============================================
  // EDITAR FICHA
  // ============================================
  const openEditDialog = (ficha: FichaData) => {
    setSelectedFicha(ficha);
    setEditFormData({
      numero: ficha.numero,
      programa_id: ficha.programa_id,
      jornada: ficha.jornada,
      fecha_inicio: ficha.fecha_inicio,
      fecha_fin: ficha.fecha_fin,
      cantidad_aprendices: ficha.cantidad_aprendices.toString(),
      coordinador_id: ficha.coordinador_id || '',
    });
    setEditDialogOpen(true);
    setResult(null);
  };

  const handleUpdateFicha = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFicha) return;

    const cantidad = parseInt(editFormData.cantidad_aprendices);
    if (isNaN(cantidad) || cantidad <= 0) {
      setResult({ success: false, message: 'La cantidad de aprendices debe ser mayor a 0' });
      return;
    }

    setOperationLoading(true);
    setResult(null);

    // Obtener nombre del instructor seleccionado
    const instructorSeleccionado = instructores.find(i => i.id === editFormData.coordinador_id);
    const nombreGestor = instructorSeleccionado?.nombres || null;

    try {
      const { data, error } = await supabase.rpc('update_ficha', {
        p_ficha_id: selectedFicha.id,
        p_numero: editFormData.numero,
        p_programa_id: editFormData.programa_id,
        p_jornada: editFormData.jornada,
        p_fecha_inicio: editFormData.fecha_inicio,
        p_fecha_fin: editFormData.fecha_fin,
        p_cantidad_aprendices: cantidad,
        p_gestor_ficha: nombreGestor,
        p_coordinador_id: editFormData.coordinador_id || null,
      });

      if (error) throw error;

      const response = typeof data === 'string' ? JSON.parse(data) : data;

      if (response.success) {
        setResult({ success: true, message: 'Ficha actualizada exitosamente' });
        fetchFichas();
        setTimeout(() => {
          setEditDialogOpen(false);
          setResult(null);
          setSelectedFicha(null);
        }, 2000);
      } else {
        throw new Error(response.error || 'Error desconocido');
      }
    } catch (error: any) {
      setResult({ success: false, message: error.message || 'Error al actualizar ficha' });
    } finally {
      setOperationLoading(false);
    }
  };

  // ============================================
  // DESACTIVAR/ACTIVAR FICHA
  // ============================================
  const openDeleteDialog = (ficha: FichaData) => {
    setSelectedFicha(ficha);
    setDeleteDialogOpen(true);
    setResult(null);
  };

  const handleToggleFichaStatus = async () => {
    if (!selectedFicha) return;

    setOperationLoading(true);

    try {
      const functionName = selectedFicha.is_active 
        ? 'deactivate_ficha' 
        : 'activate_ficha';

      const { data, error } = await supabase.rpc(functionName, {
        p_ficha_id: selectedFicha.id,
      });

      if (error) throw error;

      const response = typeof data === 'string' ? JSON.parse(data) : data;

      if (response.success) {
        fetchFichas();
        setDeleteDialogOpen(false);
        setSelectedFicha(null);
      } else {
        throw new Error(response.error || 'Error desconocido');
      }
    } catch (error: any) {
      alert(error.message || 'Error al cambiar estado de la ficha');
    } finally {
      setOperationLoading(false);
    }
  };

  // ============================================
  // UTILIDADES
  // ============================================
  const getJornadaColor = (jornada: string) => {
    const jornadaData = jornadas.find(j => j.value === jornada);
    return jornadaData?.color || "#000000";
  };

  const getJornadaLabel = (jornada: string) => {
    const jornadaData = jornadas.find(j => j.value === jornada);
    return jornadaData?.label || jornada;
  };

  const getEstadoColor = (estado?: string) => {
    if (estado === 'FINALIZADA') return 'bg-red-600';
    if (estado === 'EN_FORMACION') return 'bg-[#39A900]';
    if (estado === 'PROGRAMADA') return 'bg-blue-500';
    return 'bg-gray-500';
  };

  const getEstadoLabel = (estado?: string) => {
    if (estado === 'FINALIZADA') return 'Finalizada';
    if (estado === 'EN_FORMACION') return 'En Formación';
    if (estado === 'PROGRAMADA') return 'Programada';
    return estado || 'Desconocido';
  };

  const categories = ["Todos", ...jornadas.map(j => j.label)];

  const filteredFichas = fichas.filter(ficha => {
    const matchesSearch = ficha.numero.includes(searchTerm) ||
      (ficha.programa_nombre && ficha.programa_nombre.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedJornada === "Todos" || 
      getJornadaLabel(ficha.jornada) === selectedJornada;
    
    return matchesSearch && matchesCategory;
  });

  const stats = {
    total: fichas.filter(f => f.is_active).length,
    aprendices: fichas.reduce((sum, f) => f.is_active ? sum + f.cantidad_aprendices : sum, 0),
    enFormacion: fichas.filter(f => f.estado === 'EN_FORMACION' && f.is_active).length,
    finalizadas: fichas.filter(f => f.estado === 'FINALIZADA').length,
  };

  const canManageFichas = currentUser?.role === 'admin' || currentUser?.role === 'coordinador';

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#00304D]">Fichas de Formación</h1>
          <p className="text-gray-600 mt-1">Gestión de fichas y grupos de aprendices</p>
        </div>
        
        {canManageFichas && (
          <Dialog open={createDialogOpen} onOpenChange={(open) => {
            setCreateDialogOpen(open);
            if (!open) {
              // Limpiar formulario al cerrar
              setCreateFormData({
                numero: '',
                programa_id: '',
                jornada: 'DIURNA',
                fecha_inicio: '',
                fecha_fin: '',
                cantidad_aprendices: '',
                coordinador_id: '',
              });
              setResult(null);
            }
          }}>
            <DialogTrigger asChild>
              <Button className="bg-[#39A900] hover:bg-[#2d8000]">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Ficha
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
              <DialogHeader className="flex-shrink-0">
                <DialogTitle>Crear Nueva Ficha</DialogTitle>
                <DialogDescription>
                  Ingresa los datos de la nueva ficha de formación
                </DialogDescription>
              </DialogHeader>

              {result && (
                <Alert variant={result.success ? 'default' : 'destructive'} className="flex-shrink-0">
                  {result.success ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  <AlertDescription>{result.message}</AlertDescription>
                </Alert>
              )}

              <div className="flex-1 overflow-y-auto px-1">
                <form onSubmit={handleCreateFicha} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="numero">Número de Ficha <span className="text-red-500">*</span></Label>
                    <Input
                      id="numero"
                      placeholder="2558630"
                      value={createFormData.numero}
                      onChange={(e) => setCreateFormData({ ...createFormData, numero: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="jornada">Jornada <span className="text-red-500">*</span></Label>
                    <Select
                      value={createFormData.jornada}
                      onValueChange={(value) => setCreateFormData({ ...createFormData, jornada: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {jornadas.map(jornada => (
                          <SelectItem key={jornada.value} value={jornada.value}>
                            {jornada.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="programa">Programa <span className="text-red-500">*</span></Label>
                  <Select
                    value={createFormData.programa_id}
                    onValueChange={(value) => setCreateFormData({ ...createFormData, programa_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un programa" />
                    </SelectTrigger>
                    <SelectContent>
                      {programas.map(programa => (
                        <SelectItem key={programa.id} value={programa.id}>
                          {programa.numero} - {programa.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fecha_inicio">Fecha Inicio <span className="text-red-500">*</span></Label>
                    <Input
                      id="fecha_inicio"
                      type="date"
                      value={createFormData.fecha_inicio}
                      onChange={(e) => setCreateFormData({ ...createFormData, fecha_inicio: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fecha_fin">Fecha Fin <span className="text-red-500">*</span></Label>
                    <Input
                      id="fecha_fin"
                      type="date"
                      value={createFormData.fecha_fin}
                      onChange={(e) => setCreateFormData({ ...createFormData, fecha_fin: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cantidad">Cantidad Aprendices <span className="text-red-500">*</span></Label>
                    <Input
                      id="cantidad"
                      type="number"
                      min="1"
                      placeholder="30"
                      value={createFormData.cantidad_aprendices}
                      onChange={(e) => setCreateFormData({ ...createFormData, cantidad_aprendices: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gestor">Gestor de Ficha (Instructor)</Label>
                    <Select
                      value={createFormData.coordinador_id}
                      onValueChange={(value) => setCreateFormData({ ...createFormData, coordinador_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un instructor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="x">Sin asignar</SelectItem>
                        {instructores.map(instructor => (
                          <SelectItem key={instructor.id} value={instructor.id}>
                            {instructor.nombres} {instructor.area && `- ${instructor.area}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#39A900] hover:bg-[#2d8000]"
                  disabled={operationLoading}
                >
                  {operationLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando ficha...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Crear Ficha
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
            <p className="text-sm text-gray-600">Fichas Activas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-[#00304D]">{stats.aprendices}</div>
            <p className="text-sm text-gray-600">Total Aprendices</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-[#007832]">{stats.enFormacion}</div>
            <p className="text-sm text-gray-600">En Formación</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-red-600">{stats.finalizadas}</div>
            <p className="text-sm text-gray-600">Finalizadas</p>
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
                placeholder="Buscar por número de ficha o programa..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedJornada === category ? "default" : "outline"}
                  onClick={() => setSelectedJornada(category)}
                  className={selectedJornada === category ? "bg-[#39A900] hover:bg-[#2d8000]" : ""}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fichas Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-[#39A900]" />
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFichas.map((ficha) => (
            <Card 
              key={ficha.id} 
              className="border-l-4 hover:shadow-lg transition-shadow" 
              style={{ borderLeftColor: getJornadaColor(ficha.jornada) }}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-lg text-[#00304D]">
                        {ficha.programa_nombre || 'Programa no disponible'}
                      </h3>
                      <Badge className={getEstadoColor(ficha.estado)}>
                        {getEstadoLabel(ficha.estado)}
                      </Badge>
                      {!ficha.is_active && (
                        <Badge className="bg-gray-500">Inactiva</Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <BookOpen className="h-4 w-4 text-[#39A900]" />
                        <span className="font-medium">Ficha:</span> {ficha.numero}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="h-4 w-4 text-[#39A900]" />
                        <span className="font-medium">Aprendices:</span> {ficha.cantidad_aprendices}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4 text-[#39A900]" />
                        <span className="font-medium">Inicio:</span> {new Date(ficha.fecha_inicio).toLocaleDateString('es-CO')}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4 text-[#39A900]" />
                        <span className="font-medium">Fin:</span> {new Date(ficha.fecha_fin).toLocaleDateString('es-CO')}
                      </div>
                      {ficha.gestor_ficha && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="font-medium">Gestor:</span> {ficha.gestor_ficha}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mt-4">
                      <Badge 
                        variant="outline" 
                        style={{ borderColor: getJornadaColor(ficha.jornada), color: getJornadaColor(ficha.jornada) }}
                      >
                        {getJornadaLabel(ficha.jornada)}
                      </Badge>
                      {ficha.programa_codigo && (
                        <span className="text-sm text-gray-500">
                          Programa: {ficha.programa_codigo}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {canManageFichas && (
                      <>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => openEditDialog(ficha)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className={ficha.is_active ? "text-red-600" : "text-green-600"}
                          onClick={() => openDeleteDialog(ficha)}
                        >
                          {ficha.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </Button>
                      </>
                    )}
                    <Button 
                      className="bg-[#39A900] hover:bg-[#2d8000]"
                      onClick={() => onNavigate?.('horarios', { fichaId: ficha.id, fichaNumero: ficha.numero })}
                    >
                      Ver Horarios
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Editar */}
      <Dialog open={editDialogOpen} onOpenChange={(open) => {
        setEditDialogOpen(open);
        if (!open) {
          setSelectedFicha(null);
          setResult(null);
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Ficha</DialogTitle>
            <DialogDescription>
              Modificar información de la ficha {selectedFicha?.numero}
            </DialogDescription>
          </DialogHeader>

          {result && (
            <Alert variant={result.success ? 'default' : 'destructive'}>
              {result.success ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleUpdateFicha} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-numero">Número de Ficha</Label>
                <Input
                  id="edit-numero"
                  value={editFormData.numero}
                  onChange={(e) => setEditFormData({ ...editFormData, numero: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-jornada">Jornada</Label>
                <Select
                  value={editFormData.jornada}
                  onValueChange={(value) => setEditFormData({ ...editFormData, jornada: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {jornadas.map(jornada => (
                      <SelectItem key={jornada.value} value={jornada.value}>
                        {jornada.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-programa">Programa</Label>
              <Select
                value={editFormData.programa_id}
                onValueChange={(value) => setEditFormData({ ...editFormData, programa_id: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {programas.map(programa => (
                    <SelectItem key={programa.id} value={programa.id}>
                      {programa.numero} - {programa.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-fecha_inicio">Fecha Inicio</Label>
                <Input
                  id="edit-fecha_inicio"
                  type="date"
                  value={editFormData.fecha_inicio}
                  onChange={(e) => setEditFormData({ ...editFormData, fecha_inicio: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-fecha_fin">Fecha Fin</Label>
                <Input
                  id="edit-fecha_fin"
                  type="date"
                  value={editFormData.fecha_fin}
                  onChange={(e) => setEditFormData({ ...editFormData, fecha_fin: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-cantidad">Cantidad Aprendices</Label>
                <Input
                  id="edit-cantidad"
                  type="number"
                  min="1"
                  value={editFormData.cantidad_aprendices}
                  onChange={(e) => setEditFormData({ ...editFormData, cantidad_aprendices: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-gestor">Gestor de Ficha (Instructor)</Label>
                <Select
                  value={editFormData.coordinador_id}
                  onValueChange={(value) => setEditFormData({ ...editFormData, coordinador_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un instructor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="x">Sin asignar</SelectItem>
                    {instructores.map(instructor => (
                      <SelectItem key={instructor.id} value={instructor.id}>
                        {instructor.nombres} {instructor.area && `- ${instructor.area}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
              {selectedFicha?.is_active ? 'Â¿Desactivar ficha?' : 'Â¿Activar ficha?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedFicha?.is_active ? (
                <>
                  ¿Estás seguro de desactivar la ficha <strong>{selectedFicha?.numero}</strong>? 
                  No se podrán crear nuevos horarios para esta ficha.
                </>
              ) : (
                <>
                  ¿Estás seguro de activar la ficha <strong>{selectedFicha?.numero}</strong>?
                  Se podrán crear horarios nuevamente.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggleFichaStatus}
              className={selectedFicha?.is_active ? "bg-red-600 hover:bg-red-700" : "bg-[#39A900] hover:bg-[#2d8000]"}
              disabled={operationLoading}
            >
              {operationLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                selectedFicha?.is_active ? 'Desactivar' : 'Activar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}