// src/components/horarios/ExportModal.tsx
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";
import { Checkbox } from "../ui/checkbox";
import { Download, Loader2, XCircle, Info, FileSpreadsheet } from "lucide-react";
import * as XLSX from 'xlsx';

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
  filterMode: 'ficha' | 'instructor' | 'ambiente';
  selectedId: string;
  selectedName?: string; // Nombre de la ficha/instructor/ambiente
}

export function ExportModal({
  open,
  onClose,
  filterMode,
  selectedId,
  selectedName = '',
}: ExportModalProps) {
  
  // Fechas por defecto (3 meses desde hoy)
  const today = new Date();
  const threeMonthsLater = new Date(today);
  threeMonthsLater.setMonth(today.getMonth() + 3);
  
  const [fechaInicio, setFechaInicio] = useState(today.toISOString().split('T')[0]);
  const [fechaFin, setFechaFin] = useState(threeMonthsLater.toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Opciones
  const [incluirInactivos, setIncluirInactivos] = useState(false);
  const [incluirResumen, setIncluirResumen] = useState(true);
  const [agruparPorDia, setAgruparPorDia] = useState(true);
  
  // Info para preview
  const [totalHorarios, setTotalHorarios] = useState(0);

  // Resetear fechas cuando se abre el modal
  useEffect(() => {
    if (open) {
      const today = new Date();
      const threeMonthsLater = new Date(today);
      threeMonthsLater.setMonth(today.getMonth() + 3);
      
      setFechaInicio(today.toISOString().split('T')[0]);
      setFechaFin(threeMonthsLater.toISOString().split('T')[0]);
      setError('');
      
      // Cargar preview de cuántos horarios se exportarán
      loadPreview();
    }
  }, [open, selectedId, incluirInactivos]);

  const loadPreview = async () => {
    if (!selectedId) return;
    
    try {
      let rpcFunction = '';
      let rpcParams: any = {};

      if (filterMode === 'ficha') {
        rpcFunction = 'get_horarios_ficha';
        rpcParams = { p_ficha_id: selectedId };
      } else if (filterMode === 'instructor') {
        rpcFunction = 'get_horarios_instructor';
        rpcParams = { p_instructor_id: selectedId };
      } else if (filterMode === 'ambiente') {
        rpcFunction = 'get_horarios_ambiente';
        rpcParams = { p_ambiente_id: selectedId };
      }

      const { data, error } = await supabase.rpc(rpcFunction, rpcParams);
      
      if (error) throw error;
      
      const response = typeof data === 'string' ? JSON.parse(data) : data;
      
      if (response.success) {
        let horarios = [];
        
        if (filterMode === 'instructor') {
          horarios = response.data.horarios || [];
        } else {
          horarios = response.data || [];
        }
        
        // Filtrar por estado activo si es necesario
        if (!incluirInactivos) {
          horarios = horarios.filter((h: any) => h.is_active);
        }
        
        setTotalHorarios(horarios.length);
      }
    } catch (error) {
      console.error('Error loading preview:', error);
    }
  };

  const handleExport = async () => {
    if (!fechaInicio || !fechaFin) {
      setError('Debes seleccionar ambas fechas');
      return;
    }

    if (fechaFin < fechaInicio) {
      setError('La fecha fin debe ser mayor a la fecha inicio');
      return;
    }

    if (!selectedId) {
      setError('No hay filtro seleccionado');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Cargar horarios
      let rpcFunction = '';
      let rpcParams: any = {};

      if (filterMode === 'ficha') {
        rpcFunction = 'get_horarios_ficha';
        rpcParams = { p_ficha_id: selectedId };
      } else if (filterMode === 'instructor') {
        rpcFunction = 'get_horarios_instructor';
        rpcParams = { p_instructor_id: selectedId };
      } else if (filterMode === 'ambiente') {
        rpcFunction = 'get_horarios_ambiente';
        rpcParams = { p_ambiente_id: selectedId };
      }

      const { data, error: rpcError } = await supabase.rpc(rpcFunction, rpcParams);
      
      if (rpcError) throw rpcError;
      
      const response = typeof data === 'string' ? JSON.parse(data) : data;
      
      if (!response.success) {
        throw new Error(response.error || 'Error al cargar horarios');
      }

      let horarios = [];
      let instructorInfo = null;
      
      if (filterMode === 'instructor') {
        horarios = response.data.horarios || [];
        instructorInfo = {
          nombre: response.data.instructor_nombre,
          total_horas: response.data.total_horas_semanales,
          total_horas_clase: response.data.total_horas_clase || 0,
          total_horas_apoyo: response.data.total_horas_apoyo || 0,
        };
      } else {
        horarios = response.data || [];
      }

      // Filtrar por fechas
      const fechaInicioDate = new Date(fechaInicio);
      const fechaFinDate = new Date(fechaFin);
      
      horarios = horarios.filter((h: any) => {
        const hFechaInicio = new Date(h.fecha_inicio);
        const hFechaFin = new Date(h.fecha_fin);
        
        // Horario se solapa con el rango seleccionado
        return hFechaInicio <= fechaFinDate && hFechaFin >= fechaInicioDate;
      });

      // Filtrar por estado activo si es necesario
      if (!incluirInactivos) {
        horarios = horarios.filter((h: any) => h.is_active);
      }

      if (horarios.length === 0) {
        setError('No hay horarios para exportar en el rango de fechas seleccionado');
        setLoading(false);
        return;
      }

      // Generar Excel
      await generateExcel(horarios, instructorInfo);
      
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al exportar los datos');
    } finally {
      setLoading(false);
    }
  };

  const generateExcel = async (horarios: any[], instructorInfo: any = null) => {
    // Crear libro de Excel
    const wb = XLSX.utils.book_new();

    // ==========================================
    // HOJA 1: HORARIOS
    // ==========================================
    
    // Ordenar horarios
    if (agruparPorDia) {
      const ordenDias: any = {
        'LUNES': 1,
        'MARTES': 2,
        'MIERCOLES': 3,
        'JUEVES': 4,
        'VIERNES': 5,
        'SABADO': 6
      };
      
      horarios.sort((a, b) => {
        const diaA = ordenDias[a.dia_semana] || 7;
        const diaB = ordenDias[b.dia_semana] || 7;
        
        if (diaA !== diaB) return diaA - diaB;
        
        return a.hora_inicio.localeCompare(b.hora_inicio);
      });
    }

    // Preparar datos según el modo de filtro
    let excelData: any[] = [];
    let headers: string[] = [];

    if (filterMode === 'instructor') {
      headers = [
        'Día',
        'Hora Inicio',
        'Hora Fin',
        'Tipo',
        'Horas Semanales',
        'Ambiente',
        'Ficha',
        'Competencia',
        'Resultado',
        'Apoyo/Tema',
        'Fecha Inicio',
        'Fecha Fin',
        'Observaciones'
      ];

      excelData = horarios.map(h => ({
        'Día': h.dia_semana,
        'Hora Inicio': h.hora_inicio.substring(0, 5),
        'Hora Fin': h.hora_fin.substring(0, 5),
        'Tipo': h.tipo,
        'Horas Semanales': h.tipo === 'RESERVA' ? '0.0 (no cuenta)' : h.horas_semanales.toFixed(1),
        'Ambiente': h.ambiente_codigo || h.ambiente_nombre || '-',
        'Ficha': h.ficha_numero ? `Ficha ${h.ficha_numero}` : '-',
        'Competencia': h.competencia_nombre || '-',
        'Resultado': h.resultado_nombre || '-',
        'Apoyo/Tema': h.apoyo || h.apoyo_tipo || '-',
        'Fecha Inicio': new Date(h.fecha_inicio).toLocaleDateString('es-CO'),
        'Fecha Fin': new Date(h.fecha_fin).toLocaleDateString('es-CO'),
        'Observaciones': h.observaciones || ''
      }));
      
    } else if (filterMode === 'ficha') {
      headers = [
        'Día',
        'Hora Inicio',
        'Hora Fin',
        'Tipo',
        'Horas Semanales',
        'Instructor',
        'Ambiente',
        'Competencia',
        'Resultado',
        'Apoyo/Tema',
        'Fecha Inicio',
        'Fecha Fin',
        'Observaciones'
      ];

      excelData = horarios.map(h => ({
        'Día': h.dia_semana,
        'Hora Inicio': h.hora_inicio.substring(0, 5),
        'Hora Fin': h.hora_fin.substring(0, 5),
        'Tipo': h.tipo,
        'Horas Semanales': h.horas_semanales.toFixed(1),
        'Instructor': h.instructor_nombre || '-',
        'Ambiente': h.ambiente_codigo || h.ambiente_nombre || '-',
        'Competencia': h.competencia_nombre || '-',
        'Resultado': h.resultado_nombre || '-',
        'Apoyo/Tema': h.apoyo || '-',
        'Fecha Inicio': new Date(h.fecha_inicio).toLocaleDateString('es-CO'),
        'Fecha Fin': new Date(h.fecha_fin).toLocaleDateString('es-CO'),
        'Observaciones': h.observaciones || ''
      }));
      
    } else { // ambiente
      headers = [
        'Día',
        'Hora Inicio',
        'Hora Fin',
        'Tipo',
        'Instructor',
        'Ficha',
        'Competencia',
        'Observación',
        'Fecha Inicio',
        'Fecha Fin'
      ];

      excelData = horarios.map(h => ({
        'Día': h.dia_semana,
        'Hora Inicio': h.hora_inicio.substring(0, 5),
        'Hora Fin': h.hora_fin.substring(0, 5),
        'Tipo': h.tipo,
        'Instructor': h.instructor_nombre || '-',
        'Ficha': h.ficha_numero ? `Ficha ${h.ficha_numero}` : '-',
        'Competencia': h.competencia_nombre || '-',
        'Observación': h.observacion_reserva || h.observaciones || '-',
        'Fecha Inicio': new Date(h.fecha_inicio).toLocaleDateString('es-CO'),
        'Fecha Fin': new Date(h.fecha_fin).toLocaleDateString('es-CO')
      }));
    }

    // Crear hoja de horarios
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    // Ajustar anchos de columna
    const columnWidths = headers.map(header => {
      if (header === 'Competencia' || header === 'Resultado') return { wch: 50 };
      if (header === 'Observaciones' || header === 'Observación') return { wch: 40 };
      if (header === 'Ficha' || header === 'Instructor' || header === 'Ambiente') return { wch: 25 };
      if (header === 'Apoyo/Tema') return { wch: 20 };
      return { wch: 15 };
    });
    
    ws['!cols'] = columnWidths;
    
    XLSX.utils.book_append_sheet(wb, ws, 'Horarios');

    // ==========================================
    // HOJA 2: RESUMEN (si está activado)
    // ==========================================
    
    if (incluirResumen) {
      const resumenData: any[] = [];
      
      if (filterMode === 'instructor' && instructorInfo) {
        resumenData.push(
          { 'Campo': 'INFORMACIÓN DEL INSTRUCTOR', 'Valor': '' },
          { 'Campo': 'Nombre', 'Valor': instructorInfo.nombre },
          { 'Campo': 'Período', 'Valor': `${new Date(fechaInicio).toLocaleDateString('es-CO')} - ${new Date(fechaFin).toLocaleDateString('es-CO')}` },
          { 'Campo': '', 'Valor': '' },
          { 'Campo': 'HORAS SEMANALES', 'Valor': '' },
          { 'Campo': 'Clases', 'Valor': `${instructorInfo.total_horas_clase.toFixed(1)} horas` },
          { 'Campo': 'Apoyos', 'Valor': `${instructorInfo.total_horas_apoyo.toFixed(1)} horas` },
          { 'Campo': 'TOTAL', 'Valor': `${instructorInfo.total_horas.toFixed(1)} horas` },
          { 'Campo': '', 'Valor': '' }
        );
      }
      
      // Estadísticas generales
      const totalClases = horarios.filter(h => h.tipo === 'CLASE').length;
      const totalApoyos = horarios.filter(h => h.tipo === 'APOYO').length;
      const totalReservas = horarios.filter(h => h.tipo === 'RESERVA').length;
      
      resumenData.push(
        { 'Campo': 'DISTRIBUCIÓN POR TIPO', 'Valor': '' },
        { 'Campo': 'Clases', 'Valor': `${totalClases} horarios` },
        { 'Campo': 'Apoyos', 'Valor': `${totalApoyos} horarios` },
        { 'Campo': 'Reservas', 'Valor': `${totalReservas} horarios` },
        { 'Campo': '', 'Valor': '' },
        { 'Campo': 'DISTRIBUCIÓN POR DÍA', 'Valor': '' }
      );
      
      // Por día
      const diasSemana = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
      diasSemana.forEach(dia => {
        const horariosDia = horarios.filter(h => h.dia_semana === dia);
        const horasDia = horariosDia
          .filter(h => h.tipo !== 'RESERVA')
          .reduce((sum, h) => sum + h.horas_semanales, 0);
        
        resumenData.push({
          'Campo': dia,
          'Valor': `${horariosDia.length} horarios (${horasDia.toFixed(1)}h)`
        });
      });
      
      const wsResumen = XLSX.utils.json_to_sheet(resumenData);
      wsResumen['!cols'] = [{ wch: 30 }, { wch: 40 }];
      
      XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');
    }

    // ==========================================
    // DESCARGAR ARCHIVO
    // ==========================================
    
    let fileName = '';
    
    if (filterMode === 'instructor') {
      fileName = `Horarios_${instructorInfo?.nombre || 'Instructor'}_${fechaInicio}_${fechaFin}.xlsx`;
    } else if (filterMode === 'ficha') {
      fileName = `Horarios_Ficha_${selectedName}_${fechaInicio}_${fechaFin}.xlsx`;
    } else {
      fileName = `Horarios_Ambiente_${selectedName}_${fechaInicio}_${fechaFin}.xlsx`;
    }
    
    // Limpiar nombre de archivo
    fileName = fileName.replace(/[^a-zA-Z0-9_.-]/g, '_');
    
    XLSX.writeFile(wb, fileName);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-[#39A900]" />
            Exportar Horarios a Excel
          </DialogTitle>
          <DialogDescription>
            Descarga los horarios en formato Excel
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Info del filtro actual */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Filtro actual:</strong> {filterMode === 'ficha' ? 'Ficha' : filterMode === 'instructor' ? 'Instructor' : 'Ambiente'}
              {selectedName && <><br/><strong>Selección:</strong> {selectedName}</>}
            </AlertDescription>
          </Alert>

          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Rango de fechas */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">📅 Rango de Fechas</Label>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fecha_inicio">Fecha Inicio</Label>
                <Input
                  id="fecha_inicio"
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fecha_fin">Fecha Fin</Label>
                <Input
                  id="fecha_fin"
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Opciones */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">⚙️ Opciones</Label>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="inactivos" 
                checked={incluirInactivos}
                onCheckedChange={(checked) => setIncluirInactivos(checked as boolean)}
              />
              <label
                htmlFor="inactivos"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Incluir horarios inactivos
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="resumen" 
                checked={incluirResumen}
                onCheckedChange={(checked) => setIncluirResumen(checked as boolean)}
              />
              <label
                htmlFor="resumen"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Incluir hoja de resumen
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="agrupar" 
                checked={agruparPorDia}
                onCheckedChange={(checked) => setAgruparPorDia(checked as boolean)}
              />
              <label
                htmlFor="agrupar"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Agrupar por día de la semana
              </label>
            </div>
          </div>

          {/* Preview */}
          {totalHorarios > 0 && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Se exportarán aproximadamente <strong>{totalHorarios} horarios</strong>
              </AlertDescription>
            </Alert>
          )}

          {/* Botones */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              className="flex-1 bg-[#39A900] hover:bg-[#2d8000]" 
              onClick={handleExport}
              disabled={loading || !selectedId}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Descargar Excel
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}