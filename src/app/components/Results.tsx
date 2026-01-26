// src/components/Results.tsx
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
import { Search, Plus, Target, Loader2, CheckCircle, XCircle, Edit, UserX, UserCheck, BookOpen, Download, Upload } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

// DeclaraciÃ³n de XLSX global
declare global {
  interface Window {
    XLSX: any;
  }
}

interface ResultadoData {
  id: string;
  competencia_id: string;
  nombre: string;
  duracion_horas?: number;
  descripcion?: string;
  orden: number;
  is_active: boolean;
  created_at: string;
}

interface ProgramaOption {
  id: string;
  numero: string;
  nombre: string;
  tipo: string;
}

interface CompetenciaData {
  id: string;
  numero: string;
  nombre: string;
  programa_nombre?: string;
  programa_tipo?: string;
  programa_id?: string;
}

const getTipoColor = (tipo: string) => {
  const colors: Record<string, string> = {
    'TECNICO': '#39A900',
    'TECNOLOGO': '#00304D',
    'ESPECIALIZACION': '#71277A',
    'COMPLEMENTARIA': '#007832',
    'OPERARIO': '#FDC300',
  };
  return colors[tipo] || '#007832';
};

export function Results() {
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompetencia, setSelectedCompetencia] = useState("");
  const [resultados, setResultados] = useState<ResultadoData[]>([]);
  const [competencias, setCompetencias] = useState<CompetenciaData[]>([]);
  const [programas, setProgramas] = useState<ProgramaOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para modales
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Estados para operaciones
  const [operationLoading, setOperationLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  // Resultado seleccionado
  const [selectedResultado, setSelectedResultado] = useState<ResultadoData | null>(null);

  // Formularios
  const [createFormData, setCreateFormData] = useState({
    programa_id: '',
    competencia_id: '',
    resultados: [{ nombre: '', duracion_horas: '' }],
  });

  const [editFormData, setEditFormData] = useState({
    nombre: '',
    duracion_horas: '',
    descripcion: '',
    orden: '1',
  });

  // Filtrar competencias por programa seleccionado
  const competenciasFiltradas = createFormData.programa_id
    ? competencias.filter(c => c.programa_id === createFormData.programa_id)
    : competencias;

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

  // Cargar competencias activas con programa_id
  const fetchCompetencias = async () => {
    try {
      const { data, error } = await supabase
        .from('competencias_with_resultados')
        .select('id, numero, nombre, programa_nombre, programa_tipo, programa_id')
        .eq('is_active', true)
        .order('programa_nombre')
        .order('numero');

      if (error) throw error;
      setCompetencias(data || []);
    } catch (error) {
      console.error('Error fetching competencias:', error);
    }
  };

  // Cargar resultados
  const fetchResultados = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('resultados_aprendizaje')
        .select(`
          *,
          competencias!inner (
            numero,
            nombre,
            programas!inner (
              nombre,
              tipo
            )
          )
        `)
        .order('orden');

      if (selectedCompetencia) {
        query = query.eq('competencia_id', selectedCompetencia);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Aplanar datos para facilitar el uso
      const flattedData = data?.map((r: any) => ({
        ...r,
        competencia_numero: r.competencias?.numero,
        competencia_nombre: r.competencias?.nombre,
        programa_nombre: r.competencias?.programas?.nombre,
        programa_tipo: r.competencias?.programas?.tipo,
      })) || [];

      setResultados(flattedData);
    } catch (error) {
      console.error('Error fetching resultados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgramas();
    fetchCompetencias();
  }, []);

  useEffect(() => {
    fetchResultados();
  }, [selectedCompetencia]);

  // ============================================
  // CREAR RESULTADOS (MÃšLTIPLES)
  // ============================================
  const addResultadoRow = () => {
    setCreateFormData({
      ...createFormData,
      resultados: [
        ...createFormData.resultados,
        { nombre: '', duracion_horas: '' }
      ]
    });
  };

  const removeResultadoRow = (index: number) => {
    if (createFormData.resultados.length > 1) {
      const newResultados = createFormData.resultados.filter((_, i) => i !== index);
      setCreateFormData({ ...createFormData, resultados: newResultados });
    }
  };

  const updateResultadoRow = (index: number, field: string, value: string) => {
    const newResultados = [...createFormData.resultados];
    newResultados[index] = { ...newResultados[index], [field]: value };
    setCreateFormData({ ...createFormData, resultados: newResultados });
  };

  const handleCreateResultados = async (e: React.FormEvent) => {
    e.preventDefault();
    setOperationLoading(true);
    setResult(null);

    try {
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < createFormData.resultados.length; i++) {
        const resultado = createFormData.resultados[i];
        if (resultado.nombre.trim() === '') continue;

        const { data, error } = await supabase.rpc('create_resultado', {
          p_competencia_id: createFormData.competencia_id,
          p_nombre: resultado.nombre,
          p_duracion_horas: resultado.duracion_horas
            ? parseInt(resultado.duracion_horas)
            : null,
          p_descripcion: null,
          p_orden: i + 1, // Orden automÃ¡tico basado en la posiciÃ³n
        });

        if (error) {
          errorCount++;
          console.error('Error creating resultado:', error);
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
          message: `${successCount} resultado(s) creado(s) exitosamente${errorCount > 0 ? `. ${errorCount} con errores.` : ''}`
        });
        setCreateFormData({
          programa_id: '',
          competencia_id: '',
          resultados: [{ nombre: '', duracion_horas: '' }],
        });
        fetchResultados();
        setTimeout(() => {
          setCreateDialogOpen(false);
          setResult(null);
        }, 2000);
      } else {
        throw new Error('No se pudo crear ningÃºn resultado');
      }
    } catch (error: any) {
      setResult({ success: false, message: error.message || 'Error al crear resultados' });
    } finally {
      setOperationLoading(false);
    }
  };

  // ============================================
  // IMPORTACIÃ“N MASIVA DESDE EXCEL
  // ============================================
  const downloadResultadosTemplate = () => {
    // Crear datos de ejemplo para la plantilla
    const templateData = [
      ['Nombre del Resultado', 'Duración (horas)'],
      ['Identificar las necesidades del cliente para proponer un sistema de informaciÃ³n', '40'],
      ['DiseÃ±ar el sistema de acuerdo con los requisitos del cliente', '60'],
      ['Desarrollar el sistema que cumpla con los requisitos de la soluciÃ³n informÃ¡tica', '80'],
      ['', ''],
    ];

    // Crear hoja de cÃ¡lculo
    const ws = window.XLSX.utils.aoa_to_sheet(templateData);
    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, 'Resultados');

    // Descargar archivo
    window.XLSX.writeFile(wb, 'plantilla_resultados_aprendizaje.xlsx');
  };

  const handleImportResultadosExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!createFormData.programa_id || !createFormData.competencia_id) {
      setResult({ success: false, message: 'Primero selecciona un programa y una competencia' });
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

        // Validar que la fila tenga al menos el nombre
        if (!row[0]) continue;

        const nombre = String(row[0]).trim();
        const duracion = row[1] ? parseInt(String(row[1])) : null;

        if (!nombre) {
          errorCount++;
          continue;
        }

        const { data, error } = await supabase.rpc('create_resultado', {
          p_competencia_id: createFormData.competencia_id,
          p_nombre: nombre,
          p_duracion_horas: duracion,
          p_descripcion: null,
          p_orden: i + 1,
        });

        if (error) {
          errorCount++;
          console.error('Error creating resultado:', error);
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
          message: `${successCount} resultado(s) importado(s) exitosamente${errorCount > 0 ? `. ${errorCount} con errores.` : ''}`
        });
        fetchResultados();
        setTimeout(() => {
          setCreateDialogOpen(false);
          setResult(null);
        }, 2000);
      } else {
        throw new Error('No se pudo importar ningÃºn resultado. Verifica el formato del archivo.');
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
  // EDITAR RESULTADO
  // ============================================
  const openEditDialog = (resultado: any) => {
    setSelectedResultado(resultado);
    setEditFormData({
      nombre: resultado.nombre,
      duracion_horas: resultado.duracion_horas?.toString() || '',
      descripcion: resultado.descripcion || '',
      orden: resultado.orden.toString(),
    });
    setEditDialogOpen(true);
    setResult(null);
  };

  const handleUpdateResultado = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResultado) return;

    setOperationLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.rpc('update_resultado', {
        p_resultado_id: selectedResultado.id,
        p_nombre: editFormData.nombre,
        p_duracion_horas: editFormData.duracion_horas
          ? parseInt(editFormData.duracion_horas)
          : null,
        p_descripcion: editFormData.descripcion || null,
        p_orden: parseInt(editFormData.orden),
      });

      if (error) throw error;

      const response = typeof data === 'string' ? JSON.parse(data) : data;

      if (response.success) {
        setResult({ success: true, message: 'Resultado actualizado' });
        fetchResultados();
        setTimeout(() => {
          setEditDialogOpen(false);
          setResult(null);
          setSelectedResultado(null);
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
  // DESACTIVAR/ACTIVAR RESULTADO
  // ============================================
  const openDeleteDialog = (resultado: any) => {
    setSelectedResultado(resultado);
    setDeleteDialogOpen(true);
  };

  const handleToggleResultadoStatus = async () => {
    if (!selectedResultado) return;

    setOperationLoading(true);

    try {
      const functionName = selectedResultado.is_active
        ? 'deactivate_resultado'
        : 'activate_resultado';

      const { data, error } = await supabase.rpc(functionName, {
        p_resultado_id: selectedResultado.id,
      });

      if (error) throw error;

      const response = typeof data === 'string' ? JSON.parse(data) : data;

      if (response.success) {
        fetchResultados();
        setDeleteDialogOpen(false);
        setSelectedResultado(null);
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
  // UTILIDADES
  // ============================================
  const filteredResultados = resultados.filter((resultado: any) =>
    resultado.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resultado.competencia_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resultado.programa_nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: resultados.length,
    activos: resultados.filter(r => r.is_active).length,
    totalHoras: resultados.reduce((sum, r) => sum + (r.duracion_horas || 0), 0),
    competencias: new Set(resultados.map((r: any) => r.competencia_id)).size,
  };

  const canManageResultados = currentUser?.role === 'admin' || currentUser?.role === 'coordinador';

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
          <div className="flex items-center gap-3">
     <img 
      src="/phias.png" 
      alt="PHIAS Logo" 
      className="h-12 w-auto relative z-10"
    />
          <h1 className="text-3xl font-bold text-[#00304D]">Resultados de Aprendizaje</h1></div>
          <p className="text-gray-600 mt-1">Gestión de RAP por competencia</p>
        </div>

        {canManageResultados && (
          <Dialog open={createDialogOpen} onOpenChange={(open) => {
            setCreateDialogOpen(open);
            if (!open) {
              // Limpiar formulario al cerrar
              setCreateFormData({
                programa_id: '',
                competencia_id: '',
                resultados: [{ nombre: '', duracion_horas: '' }],
              });
              setResult(null);
            }
          }}>
            <DialogTrigger asChild>
              <Button className="bg-[#39A900] hover:bg-[#2d8000]">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Resultado
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
              <DialogHeader className="flex-shrink-0">
                <DialogTitle>Crear Nuevo Resultado de Aprendizaje</DialogTitle>
                <DialogDescription>
                  Ingresa los datos del nuevo RAP
                </DialogDescription>
              </DialogHeader>

              {result && (
                <Alert variant={result.success ? 'default' : 'destructive'} className="flex-shrink-0">
                  {result.success ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  <AlertDescription>{result.message}</AlertDescription>
                </Alert>
              )}

              <div className="flex-1 overflow-y-auto px-1">
                <form onSubmit={handleCreateResultados} className="space-y-4">
                  {/* Importación masiva */}
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-900">Importación masiva</p>
                          <p className="text-xs text-blue-700">Carga múltiples resultados desde Excel</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={downloadResultadosTemplate}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Plantilla
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={!createFormData.programa_id || !createFormData.competencia_id}
                            onClick={() => document.getElementById('excel-resultados-input')?.click()}
                          >
                            <Upload className="h-3 w-3 mr-1" />
                            Importar
                          </Button>
                          <input
                            id="excel-resultados-input"
                            type="file"
                            accept=".xlsx,.xls"
                            className="hidden"
                            onChange={handleImportResultadosExcel}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-2">
                    <Label htmlFor="programa">Programa <span className="text-red-500">*</span></Label>
                    <Select
                      value={createFormData.programa_id}
                      onValueChange={(value) => setCreateFormData({ ...createFormData, programa_id: value, competencia_id: '' })}
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

                  <div className="space-y-2">
                    <Label htmlFor="competencia">Competencia <span className="text-red-500">*</span></Label>
                    <Select
                      value={createFormData.competencia_id}
                      onValueChange={(value) => setCreateFormData({ ...createFormData, competencia_id: value })}
                      disabled={!createFormData.programa_id}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={createFormData.programa_id ? "Selecciona una competencia" : "Primero selecciona un programa"} />
                      </SelectTrigger>
                      <SelectContent>
                        {competenciasFiltradas.map(comp => (
                          <SelectItem key={comp.id} value={comp.id}>
                            {comp.numero} - {comp.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Resultados de Aprendizaje</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addResultadoRow}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Agregar Resultado
                      </Button>
                    </div>

                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {createFormData.resultados.map((resultado, index) => (
                        <Card key={index} className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Label className="text-sm font-medium">Resultado #{index + 1}</Label>
                              {createFormData.resultados.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeResultadoRow(index)}
                                >
                                  <XCircle className="h-4 w-4 text-red-600" />
                                </Button>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`nombre-${index}`}>Nombre <span className="text-red-500">*</span></Label>
                              <Textarea
                                id={`nombre-${index}`}
                                placeholder="Identificar las necesidades del cliente..."
                                value={resultado.nombre}
                                onChange={(e) => updateResultadoRow(index, 'nombre', e.target.value)}
                                rows={2}
                                required
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`duracion-${index}`}>Duración en horas (opcional)</Label>
                              <Input
                                id={`duracion-${index}`}
                                type="number"
                                min="0"
                                placeholder="40"
                                value={resultado.duracion_horas}
                                onChange={(e) => updateResultadoRow(index, 'duracion_horas', e.target.value)}
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
                    disabled={operationLoading || !createFormData.competencia_id}
                  >
                    {operationLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creando {createFormData.resultados.length} resultado(s)...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Crear {createFormData.resultados.length} Resultado(s)
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
            <p className="text-sm text-gray-600">Total RAP</p>
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
            <div className="text-2xl font-bold text-[#007832]">{stats.totalHoras}</div>
            <p className="text-sm text-gray-600">Total Horas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-[#71277A]">{stats.competencias}</div>
            <p className="text-sm text-gray-600">Competencias</p>
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
                placeholder="Buscar por nombre, competencia o programa..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedCompetencia} onValueChange={(value) => setSelectedCompetencia(value === "all" ? "" : value)}>
              <SelectTrigger className="w-full md:w-[300px]">
                <SelectValue placeholder="Todas las competencias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las competencias</SelectItem>
                {competencias.map(comp => (
                  <SelectItem key={comp.id} value={comp.id}>
                    {comp.numero} - {comp.nombre.substring(0, 40)}...
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results List */}
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-[#39A900]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResultados.map((resultado: any) => {
            const color = getTipoColor(resultado.programa_tipo || '');

            return (
              <Card key={resultado.id} className="border-l-4 hover:shadow-md transition-shadow" style={{ borderLeftColor: color }}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="h-4 w-4" style={{ color }} />
                        <Badge variant="outline" className="text-xs">
                          RAP #{resultado.orden}
                        </Badge>
                        {!resultado.is_active && (
                          <Badge className="bg-gray-500 text-xs">Inactivo</Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium text-[#00304D] line-clamp-3">
                        {resultado.nombre}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-xs text-gray-600 space-y-1">
                    <p><strong>Competencia:</strong> {resultado.competencia_numero}</p>
                    <p className="line-clamp-2">{resultado.competencia_nombre}</p>
                    {resultado.programa_nombre && (
                      <p><strong>Programa:</strong> {resultado.programa_nombre}</p>
                    )}
                  </div>

                  {resultado.duracion_horas && (
                    <div className="flex items-center gap-2">
                      <Badge style={{ backgroundColor: color }}>
                        {resultado.duracion_horas} horas
                      </Badge>
                    </div>
                  )}

                  {canManageResultados && (
                    <div className="flex gap-2 pt-3 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => openEditDialog(resultado)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={resultado.is_active ? "text-red-600" : "text-green-600"}
                        onClick={() => openDeleteDialog(resultado)}
                      >
                        {resultado.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal Editar */}
      <Dialog open={editDialogOpen} onOpenChange={(open) => {
        setEditDialogOpen(open);
        if (!open) {
          setSelectedResultado(null);
          setResult(null);
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Resultado de Aprendizaje</DialogTitle>
          </DialogHeader>

          {result && (
            <Alert variant={result.success ? 'default' : 'destructive'}>
              {result.success ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleUpdateResultado} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-nombre">Nombre</Label>
              <Textarea
                id="edit-nombre"
                value={editFormData.nombre}
                onChange={(e) => setEditFormData({ ...editFormData, nombre: e.target.value })}
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-duracion">Duración (horas)</Label>
                <Input
                  id="edit-duracion"
                  type="number"
                  min="0"
                  value={editFormData.duracion_horas}
                  onChange={(e) => setEditFormData({ ...editFormData, duracion_horas: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-orden">Orden</Label>
                <Input
                  id="edit-orden"
                  type="number"
                  min="1"
                  value={editFormData.orden}
                  onChange={(e) => setEditFormData({ ...editFormData, orden: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-descripcion">DescripciÃ³n</Label>
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
              {selectedResultado?.is_active ? 'Â¿Desactivar resultado?' : 'Â¿Activar resultado?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedResultado?.is_active ? (
                <>Â¿EstÃ¡s seguro de desactivar este resultado de aprendizaje?</>
              ) : (
                <>Â¿EstÃ¡s seguro de activar este resultado de aprendizaje?</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggleResultadoStatus}
              className={selectedResultado?.is_active ? "bg-red-600 hover:bg-red-700" : "bg-[#39A900] hover:bg-[#2d8000]"}
              disabled={operationLoading}
            >
              {operationLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                selectedResultado?.is_active ? 'Desactivar' : 'Activar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>

  );
}
