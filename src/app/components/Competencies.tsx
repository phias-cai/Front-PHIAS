// src/components/Competencies.tsx
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { Search, Plus, Target, ChevronDown, ChevronRight, Loader2, CheckCircle, XCircle, Edit, UserX, UserCheck, Download, Upload } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

// DeclaraciÃ³n de XLSX global
declare global {
  interface Window {
    XLSX: any;
  }
}

interface CompetenciaData {
  id: string;
  programa_id: string;
  numero: string;
  nombre: string;
  duracion_horas: number;
  descripcion?: string;
  orden: number;
  is_active: boolean;
  programa_numero?: string;
  programa_nombre?: string;
  programa_tipo?: string;
  resultados_count?: number;
}

interface ResultadoData {
  id: string;
  competencia_id: string;
  nombre: string;
  duracion_horas?: number;
  descripcion?: string;
  orden: number;
  is_active: boolean;
}

interface ProgramaOption {
  id: string;
  numero: string;
  nombre: string;
  tipo: string;
}

const getTipoColor = (tipo: string) => {
  const colors: Record<string, string> = {
    'TECNICO': '#39A900',
    'TECNOLOGO': '#00304D',
    'ESPECIALIZACION': '#71277A',
    'COMPLEMENTARIA': '#007832',
    'OPERARIO': '#FDC300',
  };
  return colors[tipo] || '#000000';
};

export function Competencies() {
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [competencias, setCompetencias] = useState<CompetenciaData[]>([]);
  const [programas, setProgramas] = useState<ProgramaOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [resultados, setResultados] = useState<Record<string, ResultadoData[]>>({});
  
  // Estados para modales
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createResultadoDialogOpen, setCreateResultadoDialogOpen] = useState(false);
  
  // Estados para operaciones
  const [operationLoading, setOperationLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  
  // Competencia seleccionada
  const [selectedCompetencia, setSelectedCompetencia] = useState<CompetenciaData | null>(null);
  
  // Formularios
  const [createFormData, setCreateFormData] = useState({
    programa_id: '',
    competencias: [{ numero: '', nombre: '', duracion_horas: '' }],
  });

  const [editFormData, setEditFormData] = useState({
    numero: '',
    nombre: '',
    duracion_horas: '',
    descripcion: '',
    orden: '1',
  });

  const [createResultadoFormData, setCreateResultadoFormData] = useState({
    nombre: '',
    duracion_horas: '',
    descripcion: '',
    orden: '1',
  });

  // Cargar programas
  const fetchProgramas = async () => {
    try {
      const { data, error } = await supabase
        .from('programas')
        .select('id, numero, nombre, tipo')
        .eq('is_active', true)
        .order('nombre');

      if (error) throw error;
      setProgramas(data || []);
    } catch (error) {
      console.error('Error fetching programas:', error);
    }
  };

  // Cargar competencias
  const fetchCompetencias = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('competencias_with_resultados')
        .select('*')
        .order('programa_nombre', { ascending: true })
        .order('orden', { ascending: true });

      if (error) throw error;
      setCompetencias(data || []);
    } catch (error) {
      console.error('Error fetching competencias:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar resultados de una competencia
  const fetchResultados = async (competenciaId: string) => {
    try {
      const { data, error } = await supabase
        .from('resultados_aprendizaje')
        .select('*')
        .eq('competencia_id', competenciaId)
        .eq('is_active', true)
        .order('orden');

      if (error) throw error;
      setResultados(prev => ({ ...prev, [competenciaId]: data || [] }));
    } catch (error) {
      console.error('Error fetching resultados:', error);
    }
  };

  useEffect(() => {
    fetchProgramas();
    fetchCompetencias();
  }, []);

  // Toggle competencia expandida
  const toggleItem = (id: string) => {
    const isOpening = !openItems.includes(id);
    setOpenItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
    
    // Cargar resultados si se estÃ¡ abriendo y aÃºn no se han cargado
    if (isOpening && !resultados[id]) {
      fetchResultados(id);
    }
  };

  // ============================================
  // CREAR COMPETENCIAS (MÃšLTIPLES)
  // ============================================
  const addCompetenciaRow = () => {
    setCreateFormData({
      ...createFormData,
      competencias: [
        ...createFormData.competencias,
        { numero: '', nombre: '', duracion_horas: '' }
      ]
    });
  };

  const removeCompetenciaRow = (index: number) => {
    if (createFormData.competencias.length > 1) {
      const newCompetencias = createFormData.competencias.filter((_, i) => i !== index);
      setCreateFormData({ ...createFormData, competencias: newCompetencias });
    }
  };

  const updateCompetenciaRow = (index: number, field: string, value: string) => {
    const newCompetencias = [...createFormData.competencias];
    newCompetencias[index] = { ...newCompetencias[index], [field]: value };
    setCreateFormData({ ...createFormData, competencias: newCompetencias });
  };

  const handleCreateCompetencia = async (e: React.FormEvent) => {
    e.preventDefault();
    setOperationLoading(true);
    setResult(null);

    try {
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < createFormData.competencias.length; i++) {
        const competencia = createFormData.competencias[i];
        if (competencia.nombre.trim() === '' || competencia.numero.trim() === '') continue;

        const duracion = parseInt(competencia.duracion_horas);
        if (isNaN(duracion) || duracion <= 0) {
          errorCount++;
          continue;
        }

        const { data, error } = await supabase.rpc('create_competencia', {
          p_programa_id: createFormData.programa_id,
          p_numero: competencia.numero,
          p_nombre: competencia.nombre,
          p_duracion_horas: duracion,
          p_descripcion: null,
          p_orden: i + 1, // Orden automÃ¡tico basado en la posiciÃ³n
        });

        if (error) {
          errorCount++;
          console.error('Error creating competencia:', error);
          continue;
        }

        const response = typeof data === 'string' ? JSON.parse(data) : data;

        if (response.success) {
          successCount++;
        } else {
          errorCount++;
        }
      }

      if (successCount > 0) {
        setResult({ 
          success: true, 
          message: `${successCount} competencia(s) creada(s) exitosamente${errorCount > 0 ? `. ${errorCount} con errores.` : ''}` 
        });
        setCreateFormData({
          programa_id: '',
          competencias: [{ numero: '', nombre: '', duracion_horas: '' }],
        });
        fetchCompetencias();
        setTimeout(() => {
          setCreateDialogOpen(false);
          setResult(null);
        }, 2000);
      } else {
        throw new Error('No se pudo crear ninguna competencia');
      }
    } catch (error: any) {
      setResult({ success: false, message: error.message || 'Error al crear competencias' });
    } finally {
      setOperationLoading(false);
    }
  };

  // ============================================
  // IMPORTACIÃ“N MASIVA DESDE EXCEL
  // ============================================
  const downloadCompetenciasTemplate = () => {
    // Crear datos de ejemplo para la plantilla
    const templateData = [
      ['Número', 'Nombre', 'Duración (horas)'],
      ['220501001', 'Desarrollar software aplicando técnicas de programaciÃ³n', '480'],
      ['220501002', 'Implementar estructuras de datos para soluciÃ³n de problemas', '360'],
      ['', '', ''],
    ];

    // Crear hoja de cÃ¡lculo
    const ws = window.XLSX.utils.aoa_to_sheet(templateData);
    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, 'Competencias');

    // Descargar archivo
    window.XLSX.writeFile(wb, 'plantilla_competencias.xlsx');
  };

  const handleImportCompetenciasExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!createFormData.programa_id) {
      setResult({ success: false, message: 'Primero selecciona un programa' });
      return;
    }

    setOperationLoading(true);
    setResult(null);

    try {
      const data = await file.arrayBuffer();
      const workbook = window.XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = window.XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Saltar la primera fila (encabezados)
      const rows = jsonData.slice(1) as any[];
      
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        
        // Validar que la fila tenga datos
        if (!row[0] || !row[1] || !row[2]) continue;

        const numero = String(row[0]).trim();
        const nombre = String(row[1]).trim();
        const duracion = parseInt(String(row[2]));

        if (!numero || !nombre || isNaN(duracion) || duracion <= 0) {
          errorCount++;
          continue;
        }

        const { data, error } = await supabase.rpc('create_competencia', {
          p_programa_id: createFormData.programa_id,
          p_numero: numero,
          p_nombre: nombre,
          p_duracion_horas: duracion,
          p_descripcion: null,
          p_orden: i + 1,
        });

        if (error) {
          errorCount++;
          console.error('Error creating competencia:', error);
          continue;
        }

        const response = typeof data === 'string' ? JSON.parse(data) : data;

        if (response.success) {
          successCount++;
        } else {
          errorCount++;
        }
      }

      if (successCount > 0) {
        setResult({ 
          success: true, 
          message: `${successCount} competencia(s) importada(s) exitosamente${errorCount > 0 ? `. ${errorCount} con errores.` : ''}` 
        });
        fetchCompetencias();
        setTimeout(() => {
          setCreateDialogOpen(false);
          setResult(null);
        }, 2000);
      } else {
        throw new Error('No se pudo importar ninguna competencia. Verifica el formato del archivo.');
      }
    } catch (error: any) {
      setResult({ success: false, message: error.message || 'Error al importar archivo Excel' });
    } finally {
      setOperationLoading(false);
      // Limpiar el input
      e.target.value = '';
    }
  };

  // ============================================
  // EDITAR COMPETENCIA
  // ============================================
  const openEditDialog = (competencia: CompetenciaData) => {
    setSelectedCompetencia(competencia);
    setEditFormData({
      numero: competencia.numero,
      nombre: competencia.nombre,
      duracion_horas: competencia.duracion_horas.toString(),
      descripcion: competencia.descripcion || '',
      orden: competencia.orden.toString(),
    });
    setEditDialogOpen(true);
    setResult(null);
  };

  const handleUpdateCompetencia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompetencia) return;

    const duracion = parseInt(editFormData.duracion_horas);
    if (isNaN(duracion) || duracion <= 0) {
      setResult({ success: false, message: 'La duraciÃ³n debe ser mayor a 0' });
      return;
    }

    setOperationLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.rpc('update_competencia', {
        p_competencia_id: selectedCompetencia.id,
        p_numero: editFormData.numero,
        p_nombre: editFormData.nombre,
        p_duracion_horas: duracion,
        p_descripcion: editFormData.descripcion || null,
        p_orden: parseInt(editFormData.orden),
      });

      if (error) throw error;

      const response = typeof data === 'string' ? JSON.parse(data) : data;

      if (response.success) {
        setResult({ success: true, message: 'Competencia actualizada' });
        fetchCompetencias();
        setTimeout(() => {
          setEditDialogOpen(false);
          setResult(null);
          setSelectedCompetencia(null);
        }, 2000);
      } else {
        throw new Error(response.error || 'Error desconocido');
      }
    } catch (error: any) {
      setResult({ success: false, message: error.message || 'Error al actualizar' });
    } finally {
      setOperationLoading(false);
    }
  };

  // ============================================
  // DESACTIVAR/ACTIVAR COMPETENCIA
  // ============================================
  const openDeleteDialog = (competencia: CompetenciaData) => {
    setSelectedCompetencia(competencia);
    setDeleteDialogOpen(true);
  };

  const handleToggleCompetenciaStatus = async () => {
    if (!selectedCompetencia) return;

    setOperationLoading(true);

    try {
      const functionName = selectedCompetencia.is_active 
        ? 'deactivate_competencia' 
        : 'activate_competencia';

      const { data, error } = await supabase.rpc(functionName, {
        p_competencia_id: selectedCompetencia.id,
      });

      if (error) throw error;

      const response = typeof data === 'string' ? JSON.parse(data) : data;

      if (response.success) {
        fetchCompetencias();
        setDeleteDialogOpen(false);
        setSelectedCompetencia(null);
      } else {
        throw new Error(response.error || 'Error desconocido');
      }
    } catch (error: any) {
      alert(error.message || 'Error al cambiar estado');
    } finally {
      setOperationLoading(false);
    }
  };

  // ============================================
  // CREAR RESULTADO
  // ============================================
  const openCreateResultadoDialog = (competencia: CompetenciaData) => {
    setSelectedCompetencia(competencia);
    setCreateResultadoFormData({
      nombre: '', duracion_horas: '', descripcion: '', orden: '1',
    });
    setCreateResultadoDialogOpen(true);
    setResult(null);
  };

  const handleCreateResultado = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompetencia) return;

    setOperationLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.rpc('create_resultado', {
        p_competencia_id: selectedCompetencia.id,
        p_nombre: createResultadoFormData.nombre,
        p_duracion_horas: createResultadoFormData.duracion_horas 
          ? parseInt(createResultadoFormData.duracion_horas) 
          : null,
        p_descripcion: createResultadoFormData.descripcion || null,
        p_orden: parseInt(createResultadoFormData.orden),
      });

      if (error) throw error;

      const response = typeof data === 'string' ? JSON.parse(data) : data;

      if (response.success) {
        setResult({ success: true, message: 'Resultado creado exitosamente' });
        fetchResultados(selectedCompetencia.id);
        fetchCompetencias();
        setTimeout(() => {
          setCreateResultadoDialogOpen(false);
          setResult(null);
        }, 2000);
      } else {
        throw new Error(response.error || 'Error desconocido');
      }
    } catch (error: any) {
      setResult({ success: false, message: error.message || 'Error al crear resultado' });
    } finally {
      setOperationLoading(false);
    }
  };

  // ============================================
  // UTILIDADES
  // ============================================
  const filteredCompetencies = competencias.filter(comp =>
    comp.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comp.numero.includes(searchTerm) ||
    (comp.programa_nombre && comp.programa_nombre.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const stats = {
    total: competencias.length,
    activas: competencias.filter(c => c.is_active).length,
    totalResultados: competencias.reduce((sum, c) => sum + (c.resultados_count || 0), 0),
    totalHoras: competencias.reduce((sum, c) => sum + c.duracion_horas, 0),
  };

  const canManageCompetencias = currentUser?.role === 'admin' || currentUser?.role === 'coordinador';

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
          <h1 className="text-3xl font-bold text-[#00304D]">Competencias</h1>
          <p className="text-gray-600 mt-1">Gestión de competencias y resultados de aprendizaje</p>
        </div>
        
        {canManageCompetencias && (
          <Dialog open={createDialogOpen} onOpenChange={(open) => {
            setCreateDialogOpen(open);
            if (!open) {
              // Limpiar formulario al cerrar
              setCreateFormData({
                programa_id: '',
                competencias: [{ numero: '', nombre: '', duracion_horas: '' }],
              });
              setResult(null);
            }
          }}>
            <DialogTrigger asChild>
              <Button className="bg-[#39A900] hover:bg-[#2d8000]">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Competencia
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
              <DialogHeader className="flex-shrink-0">
                <DialogTitle>Crear Nueva Competencia</DialogTitle>
                <DialogDescription>
                  Ingresa los datos de la nueva competencia
                </DialogDescription>
              </DialogHeader>

              {result && (
                <Alert variant={result.success ? 'default' : 'destructive'} className="flex-shrink-0">
                  {result.success ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  <AlertDescription>{result.message}</AlertDescription>
                </Alert>
              )}

              <div className="flex-1 overflow-y-auto px-1">
                <form onSubmit={handleCreateCompetencia} className="space-y-4">
                {/* Importación masiva */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-900">Importación masiva</p>
                        <p className="text-xs text-blue-700">Carga múltiples competencias desde Excel</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={downloadCompetenciasTemplate}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Plantilla
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={!createFormData.programa_id}
                          onClick={() => document.getElementById('excel-competencias-input')?.click()}
                        >
                          <Upload className="h-3 w-3 mr-1" />
                          Importar
                        </Button>
                        <input
                          id="excel-competencias-input"
                          type="file"
                          accept=".xlsx,.xls"
                          className="hidden"
                          onChange={handleImportCompetenciasExcel}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

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

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Competencias</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={addCompetenciaRow}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Agregar Competencia
                    </Button>
                  </div>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {createFormData.competencias.map((competencia, index) => (
                      <Card key={index} className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Competencia #{index + 1}</Label>
                            {createFormData.competencias.length > 1 && (
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon"
                                onClick={() => removeCompetenciaRow(index)}
                              >
                                <XCircle className="h-4 w-4 text-red-600" />
                              </Button>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label htmlFor={`numero-${index}`}>Número <span className="text-red-500">*</span></Label>
                              <Input
                                id={`numero-${index}`}
                                placeholder="220501001"
                                value={competencia.numero}
                                onChange={(e) => updateCompetenciaRow(index, 'numero', e.target.value)}
                                required
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`duracion-${index}`}>Duración (horas) <span className="text-red-500">*</span></Label>
                              <Input
                                id={`duracion-${index}`}
                                type="number"
                                min="1"
                                placeholder="480"
                                value={competencia.duracion_horas}
                                onChange={(e) => updateCompetenciaRow(index, 'duracion_horas', e.target.value)}
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`nombre-${index}`}>Nombre de la Competencia <span className="text-red-500">*</span></Label>
                            <Input
                              id={`nombre-${index}`}
                              placeholder="Desarrollar software aplicando técnicas..."
                              value={competencia.nombre}
                              onChange={(e) => updateCompetenciaRow(index, 'nombre', e.target.value)}
                              required
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#39A900] hover:bg-[#2d8000]"
                  disabled={operationLoading || !createFormData.programa_id}
                >
                  {operationLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando {createFormData.competencias.length} competencia(s)...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Crear {createFormData.competencias.length} Competencia(s)
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
            <p className="text-sm text-gray-600">Total Competencias</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-[#00304D]">{stats.totalResultados}</div>
            <p className="text-sm text-gray-600">Resultados de Aprendizaje</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-[#007832]">{programas.length}</div>
            <p className="text-sm text-gray-600">Programas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-[#71277A]">{stats.totalHoras}</div>
            <p className="text-sm text-gray-600">Horas Totales</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nombre, cÃ³digo o programa..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Competencies List */}
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-[#39A900]" />
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCompetencies.map((competency) => {
            const isOpen = openItems.includes(competency.id);
            const color = getTipoColor(competency.programa_tipo || '');
            
            return (
              <Card key={competency.id} className="border-l-4" style={{ borderLeftColor: color }}>
                <Collapsible open={isOpen} onOpenChange={() => toggleItem(competency.id)}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <Target className="h-6 w-6 mt-1" style={{ color }} />
                          <div className="flex-1">
                            <CardTitle className="text-lg text-[#00304D] mb-2">
                              {competency.nombre}
                            </CardTitle>
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="outline">
                                CÃ³digo: {competency.numero}
                              </Badge>
                              <Badge style={{ backgroundColor: color }}>
                                {competency.duracion_horas} horas
                              </Badge>
                              {competency.programa_nombre && (
                                <span className="text-sm text-gray-500">
                                  {competency.programa_nombre}
                                </span>
                              )}
                              {!competency.is_active && (
                                <Badge className="bg-gray-500">Inactiva</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Badge variant="outline" className="text-xs">
                          {competency.resultados_count || 0} RAP
                        </Badge>
                        {canManageCompetencias && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditDialog(competency);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className={competency.is_active ? "text-red-600" : "text-green-600"}
                              onClick={(e) => {
                                e.stopPropagation();
                                openDeleteDialog(competency);
                              }}
                            >
                              {competency.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                            </Button>
                          </>
                        )}
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="icon">
                            {isOpen ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="border-t pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-[#00304D]">
                            Resultados de Aprendizaje (RAP)
                          </h4>
                          {canManageCompetencias && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => openCreateResultadoDialog(competency)}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Agregar RAP
                            </Button>
                          )}
                        </div>
                        <div className="space-y-2">
                          {resultados[competency.id] && resultados[competency.id].length > 0 ? (
                            resultados[competency.id].map((outcome, index) => (
                              <div key={outcome.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <div
                                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white flex-shrink-0"
                                  style={{ backgroundColor: color }}
                                >
                                  {index + 1}
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm text-gray-700">{outcome.nombre}</p>
                                  {outcome.duracion_horas && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      {outcome.duracion_horas} horas
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500 text-center py-4">
                              No hay resultados de aprendizaje registrados
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal Editar Competencia */}
      <Dialog open={editDialogOpen} onOpenChange={(open) => {
        setEditDialogOpen(open);
        if (!open) {
          setSelectedCompetencia(null);
          setResult(null);
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Competencia</DialogTitle>
          </DialogHeader>

          {result && (
            <Alert variant={result.success ? 'default' : 'destructive'}>
              {result.success ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleUpdateCompetencia} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-numero">Número</Label>
                <Input
                  id="edit-numero"
                  value={editFormData.numero}
                  onChange={(e) => setEditFormData({ ...editFormData, numero: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-duracion">Duración (horas)</Label>
                <Input
                  id="edit-duracion"
                  type="number"
                  min="1"
                  value={editFormData.duracion_horas}
                  onChange={(e) => setEditFormData({ ...editFormData, duracion_horas: e.target.value })}
                  required
                />
              </div>
            </div>

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

      {/* Modal Crear Resultado */}
      <Dialog open={createResultadoDialogOpen} onOpenChange={(open) => {
        setCreateResultadoDialogOpen(open);
        if (!open) {
          // Limpiar formulario al cerrar
          setCreateResultadoFormData({
            nombre: '',
            duracion_horas: '',
            descripcion: '',
            orden: '1',
          });
          setResult(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Resultado de Aprendizaje</DialogTitle>
            <DialogDescription>
              Para: {selectedCompetencia?.nombre}
            </DialogDescription>
          </DialogHeader>

          {result && (
            <Alert variant={result.success ? 'default' : 'destructive'}>
              {result.success ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleCreateResultado} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resultado-nombre">Nombre del Resultado <span className="text-red-500">*</span></Label>
              <Textarea
                id="resultado-nombre"
                placeholder="Identificar las necesidades del cliente..."
                value={createResultadoFormData.nombre}
                onChange={(e) => setCreateResultadoFormData({ ...createResultadoFormData, nombre: e.target.value })}
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="resultado-horas">Duración (horas)</Label>
                <Input
                  id="resultado-horas"
                  type="number"
                  min="0"
                  placeholder="40"
                  value={createResultadoFormData.duracion_horas}
                  onChange={(e) => setCreateResultadoFormData({ ...createResultadoFormData, duracion_horas: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="resultado-orden">Orden</Label>
                <Input
                  id="resultado-orden"
                  type="number"
                  min="1"
                  value={createResultadoFormData.orden}
                  onChange={(e) => setCreateResultadoFormData({ ...createResultadoFormData, orden: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateResultadoDialogOpen(false)}>
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
                    Creando...
                  </>
                ) : (
                  'Crear Resultado'
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
              {selectedCompetencia?.is_active ? 'Â¿Desactivar competencia?' : 'Â¿Activar competencia?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedCompetencia?.is_active ? (
                <>
                  Â¿EstÃ¡s seguro de desactivar <strong>{selectedCompetencia?.nombre}</strong>?
                </>
              ) : (
                <>
                  Â¿EstÃ¡s seguro de activar <strong>{selectedCompetencia?.nombre}</strong>?
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggleCompetenciaStatus}
              className={selectedCompetencia?.is_active ? "bg-red-600 hover:bg-red-700" : "bg-[#39A900] hover:bg-[#2d8000]"}
              disabled={operationLoading}
            >
              {operationLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                selectedCompetencia?.is_active ? 'Desactivar' : 'Activar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </div>
  
  );
}