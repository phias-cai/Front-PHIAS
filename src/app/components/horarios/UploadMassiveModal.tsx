// src/components/horarios/UploadMassiveModal.tsx
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Button } from "../ui/button";
import { Alert, AlertDescription } from "../ui/alert";
import { Progress } from "../ui/progress";
import { Upload, Download, Loader2, CheckCircle, XCircle, AlertTriangle, FileSpreadsheet } from "lucide-react";
import * as XLSX from 'xlsx';

interface UploadMassiveModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedFicha: string;
  fichaNumero: string;
  programaNombre: string;
}

interface ValidationError {
  fila: number;
  campo: string;
  error: string;
}

interface ProcessResult {
  total: number;
  exitosos: number;
  errores: number;
  detalles: Array<{
    fila: number;
    status: 'success' | 'error';
    mensaje: string;
  }>;
}

// 🔧 FUNCIÓN: Convertir formato decimal de Excel a hora HH:MM
const excelTimeToHHMM = (value: any): string | null => {
  if (!value && value !== 0) return null;
  
  // Si ya es string con formato HH:MM, devolverlo
  if (typeof value === 'string' && /^\d{1,2}:\d{2}/.test(value)) {
    return value.split(':').slice(0, 2).join(':');
  }
  
  // Si es número decimal (formato de Excel)
  if (typeof value === 'number') {
    // Excel guarda las horas como fracción del día
    // 0.5 = 12:00 (medio día), 0.5416666... = 13:00, etc.
    const totalMinutes = Math.round(value * 24 * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }
  
  // Intentar convertir a string y parsear
  const strValue = String(value).trim();
  if (/^\d{1,2}:\d{2}/.test(strValue)) {
    return strValue.split(':').slice(0, 2).join(':');
  }
  
  return null;
};

export function UploadMassiveModal({
  open,
  onClose,
  onSuccess,
  selectedFicha,
  fichaNumero,
  programaNombre,
}: UploadMassiveModalProps) {
  
  const [step, setStep] = useState<'upload' | 'validating' | 'processing' | 'results'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [processResult, setProcessResult] = useState<ProcessResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Datos de referencia
  const [instructores, setInstructores] = useState<any[]>([]);
  const [ambientes, setAmbientes] = useState<any[]>([]);
  const [competencias, setCompetencias] = useState<any[]>([]);
  const [resultados, setResultados] = useState<any[]>([]);

  useEffect(() => {
    if (open && selectedFicha) {
      loadReferenceData();
    }
  }, [open, selectedFicha]);

  const loadReferenceData = async () => {
    try {
      // Cargar instructores
      const { data: instructoresData } = await supabase
        .from('profiles')
        .select('id, nombres, documento')
        .eq('rol', 'instructor')
        .eq('is_active', true);
      
      setInstructores(instructoresData || []);

      // Cargar ambientes
      const { data: ambientesData } = await supabase
        .from('ambientes')
        .select('id, codigo, nombre, capacidad')
        .eq('is_active', true);
      
      setAmbientes(ambientesData || []);

      // Obtener programa de la ficha
      const { data: fichaData } = await supabase
        .from('fichas')
        .select('programa_id')
        .eq('id', selectedFicha)
        .single();

      if (fichaData) {
        // Cargar competencias del programa
        const { data: competenciasData } = await supabase
          .from('competencias')
          .select('id, numero, nombre, orden')
          .eq('programa_id', fichaData.programa_id)
          .eq('is_active', true)
          .order('orden');
        
        setCompetencias(competenciasData || []);

        // Cargar resultados de esas competencias
        if (competenciasData && competenciasData.length > 0) {
          const competenciaIds = competenciasData.map(c => c.id);
          
          const { data: resultadosData } = await supabase
            .from('resultados_aprendizaje')
            .select('id, competencia_id, nombre, orden')
            .in('competencia_id', competenciaIds)
            .eq('is_active', true)
            .order('orden');
          
          setResultados(resultadosData || []);
        }
      }
    } catch (error) {
      console.error('Error loading reference data:', error);
    }
  };

  const handleDownloadTemplate = async () => {
    setLoading(true);
    
    try {
      // Crear libro de Excel
      const wb = XLSX.utils.book_new();

      // ==========================================
      // HOJA 1: INSTRUCCIONES
      // ==========================================
      const instrucciones = [
        ['📚 PLANTILLA DE CARGA MASIVA - HORARIOS POR FICHA'],
        [''],
        [`Ficha: ${fichaNumero}`],
        [`Programa: ${programaNombre}`],
        [''],
        ['📖 CÓMO USAR ESTA PLANTILLA'],
        [''],
        ['1. Complete SOLO la hoja "Horarios"'],
        ['2. NO modifique los encabezados (campos con *)'],
        ['3. Use el formato de fecha: DD/MM/AAAA (ejemplo: 06/01/2026)'],
        ['4. Use el formato de hora: HH:MM (ejemplos: 08:00, 8:00, 13:00, 17:30)'],
        ['   • Puede usar 1 o 2 dígitos para la hora (8:00 o 08:00)'],
        ['   • Formato 24 horas (00:00 a 23:59)'],
        ['   • IMPORTANTE: Si Excel convierte la hora a número decimal,'],
        ['     cambie el formato de la celda a TEXTO antes de escribir la hora'],
        ['   • Para cambiar a texto: Click derecho > Formato de celdas > Texto'],
        ['   • O escriba un apóstrofe antes: \'13:00 (Excel lo tratará como texto)'],
        ['5. Los campos marcados con * son obligatorios'],
        ['6. Guarde el archivo y súbalo en la aplicación'],
        [''],
        ['⚠️ VALIDACIONES AUTOMÁTICAS:'],
        [''],
        ['- No se permiten conflictos de horario'],
        ['- El instructor debe existir en el sistema (use el documento)'],
        ['- El ambiente debe existir y estar disponible (use el código)'],
        ['- Las competencias deben pertenecer al programa (use el código)'],
        ['- Los resultados deben pertenecer a la competencia (use el número)'],
        ['- Las horas deben estar en rango válido (00:00 a 23:59)'],
        [''],
        ['📋 VALORES PERMITIDOS PARA "DÍA":'],
        ['LUNES, MARTES, MIERCOLES, JUEVES, VIERNES, SABADO'],
        [''],
        ['⏰ EJEMPLOS DE HORAS VÁLIDAS:'],
        ['08:00 (mañana) | 8:00 (también válido sin el cero)'],
        ['13:00 (tarde) | 17:30 (tarde con minutos) | 20:00 (noche)'],
        [''],
        ['⚠️ PROBLEMA COMÚN CON EXCEL:'],
        ['Si Excel muestra 0.541666... en lugar de 13:00:'],
        ['1. Seleccione las celdas de hora'],
        ['2. Click derecho > Formato de celdas'],
        ['3. Elija "Texto" en lugar de "Número"'],
        ['4. Escriba de nuevo la hora (ej: 13:00)'],
        [''],
        ['O simplemente escriba un apóstrofe antes: \'13:00'],
        [''],
        ['💡 CONSEJOS:'],
        ['- Revise las hojas de referencia antes de llenar'],
        ['- Use copiar y pegar para evitar errores de escritura'],
        ['- Puede dejar filas vacías entre horarios'],
        ['- El campo "Apoyo/Tema" es opcional pero recomendado'],
        ['- El sistema puede leer horas en formato decimal, pero es mejor usar texto'],
      ];

      const wsInstrucciones = XLSX.utils.aoa_to_sheet(instrucciones);
      wsInstrucciones['!cols'] = [{ wch: 80 }];
      XLSX.utils.book_append_sheet(wb, wsInstrucciones, 'INSTRUCCIONES');

      // ==========================================
      // HOJA 2: HORARIOS (Para llenar)
      // ==========================================
      const horariosHeaders = [
        'Día*',
        'Hora Inicio* (HH:MM)',
        'Hora Fin* (HH:MM)',
        'Instructor* (Documento)',
        'Ambiente* (Código)',
        'Competencia* (Código)',
        'Resultado* (Número)',
        'Apoyo/Tema',
        'Fecha Inicio* (DD/MM/AAAA)',
        'Fecha Fin* (DD/MM/AAAA)',
        'Observaciones'
      ];

      // Filas de ejemplo
      const horariosEjemplos = [
        ['LUNES', '08:00', '10:00', '1234567890', 'CAD-A', '220501001', '01', 'Backend', '06/01/2026', '28/03/2026', ''],
        ['MARTES', '14:00', '17:00', '1234567890', 'LAB-102', '220501002', '01', 'PostgreSQL', '07/01/2026', '29/03/2026', 'Traer laptop'],
        ['', '', '', '', '', '', '', '', '', '', ''],
      ];

      const wsHorarios = XLSX.utils.aoa_to_sheet([horariosHeaders, ...horariosEjemplos]);
      wsHorarios['!cols'] = [
        { wch: 12 },  // Día
        { wch: 15 },  // Hora Inicio
        { wch: 15 },  // Hora Fin
        { wch: 20 },  // Instructor
        { wch: 15 },  // Ambiente
        { wch: 15 },  // Competencia
        { wch: 12 },  // Resultado
        { wch: 20 },  // Apoyo
        { wch: 18 },  // Fecha Inicio
        { wch: 18 },  // Fecha Fin
        { wch: 30 },  // Observaciones
      ];
      
      XLSX.utils.book_append_sheet(wb, wsHorarios, 'Horarios');

      // ==========================================
      // HOJA 3: INSTRUCTORES DISPONIBLES
      // ==========================================
      const instructoresData = [
        ['Documento', 'Nombre Completo'],
        ...instructores.map(i => [i.documento, i.nombres])
      ];

      const wsInstructores = XLSX.utils.aoa_to_sheet(instructoresData);
      wsInstructores['!cols'] = [{ wch: 15 }, { wch: 40 }];
      XLSX.utils.book_append_sheet(wb, wsInstructores, 'Instructores Disponibles');

      // ==========================================
      // HOJA 4: AMBIENTES DISPONIBLES
      // ==========================================
      const ambientesData = [
        ['Código', 'Nombre', 'Capacidad'],
        ...ambientes.map(a => [a.codigo, a.nombre, a.capacidad || 'N/A'])
      ];

      const wsAmbientes = XLSX.utils.aoa_to_sheet(ambientesData);
      wsAmbientes['!cols'] = [{ wch: 15 }, { wch: 40 }, { wch: 12 }];
      XLSX.utils.book_append_sheet(wb, wsAmbientes, 'Ambientes Disponibles');

      // ==========================================
      // HOJA 5: COMPETENCIAS DEL PROGRAMA
      // ==========================================
      const competenciasData = [
        ['Código', 'Nombre'],
        ...competencias.map(c => [c.numero, c.nombre])
      ];

      const wsCompetencias = XLSX.utils.aoa_to_sheet(competenciasData);
      wsCompetencias['!cols'] = [{ wch: 15 }, { wch: 60 }];
      XLSX.utils.book_append_sheet(wb, wsCompetencias, 'Competencias del Programa');

      // ==========================================
      // HOJA 6: RESULTADOS POR COMPETENCIA
      // ==========================================
      const resultadosData = [
        ['Competencia (Código)', 'Número', 'Resultado de Aprendizaje'],
      ];

      competencias.forEach(comp => {
        const resultadosComp = resultados.filter(r => r.competencia_id === comp.id);
        resultadosComp.forEach((r, index) => {
          resultadosData.push([
            comp.numero,
            String(index + 1).padStart(2, '0'),
            r.nombre
          ]);
        });
      });

      const wsResultados = XLSX.utils.aoa_to_sheet(resultadosData);
      wsResultados['!cols'] = [{ wch: 20 }, { wch: 10 }, { wch: 60 }];
      XLSX.utils.book_append_sheet(wb, wsResultados, 'Resultados por Competencia');

      // ==========================================
      // DESCARGAR
      // ==========================================
      const fileName = `Plantilla_Horarios_Ficha_${fichaNumero}.xlsx`;
      XLSX.writeFile(wb, fileName);

    } catch (error) {
      console.error('Error generating template:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setValidationErrors([]);
      setProcessResult(null);
      setStep('upload');
    }
  };

  const handleValidateAndProcess = async () => {
    if (!file) return;

    setStep('validating');
    setProgress(10);

    try {
      // Leer archivo Excel
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      
      // Leer hoja "Horarios"
      const worksheet = workbook.Sheets['Horarios'];
      if (!worksheet) {
        throw new Error('No se encontró la hoja "Horarios" en el archivo');
      }

      // Convertir a JSON
      const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
      
      if (jsonData.length === 0) {
        throw new Error('El archivo no contiene datos');
      }

      setProgress(30);

      // Validar datos
      const errors: ValidationError[] = [];
      const horariosValidos: any[] = [];

      for (let i = 0; i < jsonData.length; i++) {
        const fila = i + 2; // +2 porque la fila 1 son headers y Excel empieza en 1
        const row = jsonData[i];

        // Saltar filas vacías
        if (!row['Día*'] && !row['Hora Inicio* (HH:MM)']) continue;

        const horario: any = {};

        // Validar Día
        const dia = String(row['Día*'] || '').trim().toUpperCase();
        const diasValidos = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
        
        if (!dia) {
          errors.push({ fila, campo: 'Día', error: 'Campo obligatorio' });
        } else if (!diasValidos.includes(dia)) {
          errors.push({ fila, campo: 'Día', error: `Debe ser uno de: ${diasValidos.join(', ')}` });
        } else {
          horario.dia_semana = dia;
        }

        // Validar Horas
        const horaInicioRaw = row['Hora Inicio* (HH:MM)'];
        const horaFinRaw = row['Hora Fin* (HH:MM)'];
        
        // Convertir desde formato Excel si es necesario
        const horaInicio = excelTimeToHHMM(horaInicioRaw);
        const horaFin = excelTimeToHHMM(horaFinRaw);
        
        if (!horaInicio) {
          errors.push({ fila, campo: 'Hora Inicio', error: `Campo obligatorio o formato inválido: "${horaInicioRaw}". Use HH:MM (ej: 08:00 o 13:00)` });
        } else {
          // Validar formato HH:MM
          if (!/^\d{1,2}:\d{2}$/.test(horaInicio)) {
            errors.push({ fila, campo: 'Hora Inicio', error: `Formato inválido: "${horaInicio}". Use HH:MM (ej: 08:00 o 13:00)` });
          } else {
            // Asegurar formato HH:MM:SS para la BD
            const [h, m] = horaInicio.split(':');
            const hora = h.padStart(2, '0');
            const minuto = m.padStart(2, '0');
            
            // Validar rango (00-23 para horas, 00-59 para minutos)
            if (parseInt(hora) > 23 || parseInt(minuto) > 59) {
              errors.push({ fila, campo: 'Hora Inicio', error: `Hora fuera de rango: "${horaInicio}". Use 00:00 a 23:59` });
            } else {
              horario.hora_inicio = `${hora}:${minuto}:00`;
            }
          }
        }

        if (!horaFin) {
          errors.push({ fila, campo: 'Hora Fin', error: `Campo obligatorio o formato inválido: "${horaFinRaw}". Use HH:MM (ej: 10:00 o 17:00)` });
        } else {
          // Validar formato HH:MM
          if (!/^\d{1,2}:\d{2}$/.test(horaFin)) {
            errors.push({ fila, campo: 'Hora Fin', error: `Formato inválido: "${horaFin}". Use HH:MM (ej: 10:00 o 17:00)` });
          } else {
            // Asegurar formato HH:MM:SS para la BD
            const [h, m] = horaFin.split(':');
            const hora = h.padStart(2, '0');
            const minuto = m.padStart(2, '0');
            
            // Validar rango (00-23 para horas, 00-59 para minutos)
            if (parseInt(hora) > 23 || parseInt(minuto) > 59) {
              errors.push({ fila, campo: 'Hora Fin', error: `Hora fuera de rango: "${horaFin}". Use 00:00 a 23:59` });
            } else {
              horario.hora_fin = `${hora}:${minuto}:00`;
            }
          }
        }

        // Validar Instructor (por documento)
        const docInstructor = String(row['Instructor* (Documento)'] || '').trim();
        if (!docInstructor) {
          errors.push({ fila, campo: 'Instructor', error: 'Campo obligatorio' });
        } else {
          const instructor = instructores.find(i => i.documento === docInstructor);
          if (!instructor) {
            errors.push({ fila, campo: 'Instructor', error: `No se encontró instructor con documento ${docInstructor}` });
          } else {
            horario.instructor_id = instructor.id;
          }
        }

        // Validar Ambiente (por código)
        const codigoAmbiente = String(row['Ambiente* (Código)'] || '').trim();
        if (!codigoAmbiente) {
          errors.push({ fila, campo: 'Ambiente', error: 'Campo obligatorio' });
        } else {
          const ambiente = ambientes.find(a => a.codigo === codigoAmbiente);
          if (!ambiente) {
            errors.push({ fila, campo: 'Ambiente', error: `No se encontró ambiente con código ${codigoAmbiente}` });
          } else {
            horario.ambiente_id = ambiente.id;
          }
        }

        // Validar Competencia (por número/código)
        const numCompetencia = String(row['Competencia* (Código)'] || '').trim();
        if (!numCompetencia) {
          errors.push({ fila, campo: 'Competencia', error: 'Campo obligatorio' });
        } else {
          const competencia = competencias.find(c => c.numero === numCompetencia);
          if (!competencia) {
            errors.push({ fila, campo: 'Competencia', error: `No se encontró competencia ${numCompetencia} en el programa` });
          } else {
            horario.competencia_id = competencia.id;
          }
        }

        // Validar Resultado (por número dentro de la competencia)
        const numResultado = String(row['Resultado* (Número)'] || '').trim();
        if (!numResultado) {
          errors.push({ fila, campo: 'Resultado', error: 'Campo obligatorio' });
        } else if (horario.competencia_id) {
          const resultadosComp = resultados.filter(r => r.competencia_id === horario.competencia_id);
          const resultadoIndex = parseInt(numResultado) - 1;
          
          if (resultadoIndex < 0 || resultadoIndex >= resultadosComp.length) {
            errors.push({ fila, campo: 'Resultado', error: `Número de resultado inválido para esta competencia` });
          } else {
            horario.resultado_id = resultadosComp[resultadoIndex].id;
          }
        }

        // Apoyo/Tema (opcional)
        horario.apoyo = String(row['Apoyo/Tema'] || '').trim() || null;

        // Validar Fechas
        const fechaInicioStr = String(row['Fecha Inicio* (DD/MM/AAAA)'] || '').trim();
        const fechaFinStr = String(row['Fecha Fin* (DD/MM/AAAA)'] || '').trim();
        
        if (!fechaInicioStr) {
          errors.push({ fila, campo: 'Fecha Inicio', error: 'Campo obligatorio' });
        } else {
          const fechaParts = fechaInicioStr.split('/');
          if (fechaParts.length === 3) {
            const [dia, mes, anio] = fechaParts;
            horario.fecha_inicio = `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
          } else {
            errors.push({ fila, campo: 'Fecha Inicio', error: 'Formato inválido. Use DD/MM/AAAA' });
          }
        }

        if (!fechaFinStr) {
          errors.push({ fila, campo: 'Fecha Fin', error: 'Campo obligatorio' });
        } else {
          const fechaParts = fechaFinStr.split('/');
          if (fechaParts.length === 3) {
            const [dia, mes, anio] = fechaParts;
            horario.fecha_fin = `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
          } else {
            errors.push({ fila, campo: 'Fecha Fin', error: 'Formato inválido. Use DD/MM/AAAA' });
          }
        }

        // Observaciones (opcional)
        horario.observaciones = String(row['Observaciones'] || '').trim() || null;

        // Si la fila tiene errores, no agregarla
        const erroresFila = errors.filter(e => e.fila === fila);
        if (erroresFila.length === 0) {
          horario.fila_original = fila;
          horariosValidos.push(horario);
        }
      }

      setProgress(60);

      // Si hay errores de validación, mostrarlos
      if (errors.length > 0) {
        setValidationErrors(errors);
        setStep('upload');
        return;
      }

      // Procesar horarios válidos
      setStep('processing');
      setProgress(70);

      const result: ProcessResult = {
        total: horariosValidos.length,
        exitosos: 0,
        errores: 0,
        detalles: []
      };

      for (let i = 0; i < horariosValidos.length; i++) {
        const horario = horariosValidos[i];
        
        try {
          const { data, error } = await supabase.rpc('create_horario_clase', {
            p_ficha_id: selectedFicha,
            p_competencia_id: horario.competencia_id,
            p_resultado_id: horario.resultado_id,
            p_instructor_id: horario.instructor_id,
            p_ambiente_id: horario.ambiente_id,
            p_fecha_inicio: horario.fecha_inicio,
            p_fecha_fin: horario.fecha_fin,
            p_dia_semana: horario.dia_semana,
            p_hora_inicio: horario.hora_inicio,
            p_hora_fin: horario.hora_fin,
            p_apoyo: horario.apoyo,
            p_observaciones: horario.observaciones,
          });

          if (error) throw error;

          const response = typeof data === 'string' ? JSON.parse(data) : data;

          if (response.success) {
            result.exitosos++;
            result.detalles.push({
              fila: horario.fila_original,
              status: 'success',
              mensaje: 'Horario creado exitosamente'
            });
          } else {
            throw new Error(response.error);
          }
        } catch (error: any) {
          result.errores++;
          result.detalles.push({
            fila: horario.fila_original,
            status: 'error',
            mensaje: error.message || 'Error desconocido'
          });
        }

        // Actualizar progreso
        setProgress(70 + ((i + 1) / horariosValidos.length) * 30);
      }

      setProcessResult(result);
      setStep('results');
      
      if (result.exitosos > 0) {
        onSuccess();
      }

    } catch (error: any) {
      setValidationErrors([{
        fila: 0,
        campo: 'General',
        error: error.message || 'Error al procesar el archivo'
      }]);
      setStep('upload');
    }
  };

  const handleReset = () => {
    setFile(null);
    setValidationErrors([]);
    setProcessResult(null);
    setProgress(0);
    setStep('upload');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-[#39A900]" />
            Carga Masiva de Horarios
          </DialogTitle>
          <DialogDescription>
            Ficha {fichaNumero} - {programaNombre}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1 py-4 space-y-4">
          
          {/* PASO 1: DESCARGAR PLANTILLA */}
          {step === 'upload' && (
            <>
              <Alert>
                <FileSpreadsheet className="h-4 w-4" />
                <AlertDescription>
                  <strong>Paso 1:</strong> Descarga la plantilla Excel, complétala con los horarios y súbela aquí.
                </AlertDescription>
              </Alert>

              <Button
                variant="outline"
                className="w-full"
                onClick={handleDownloadTemplate}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generando plantilla...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Descargar Plantilla Excel
                  </>
                )}
              </Button>

              {/* SUBIR ARCHIVO */}
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-sm text-gray-600 mb-2">
                    Arrastra y suelta el archivo Excel aquí, o haz click para seleccionar
                  </p>
                  <p className="text-xs text-gray-400">
                    Formatos permitidos: .xlsx, .xls
                  </p>
                </label>
              </div>

              {file && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Archivo seleccionado:</strong> {file.name}
                  </AlertDescription>
                </Alert>
              )}

              {/* ERRORES DE VALIDACIÓN */}
              {validationErrors.length > 0 && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Se encontraron {validationErrors.length} errores:</strong>
                    <div className="mt-2 max-h-40 overflow-y-auto text-xs space-y-1">
                      {validationErrors.map((err, idx) => (
                        <div key={idx}>
                          • Fila {err.fila}, Campo "{err.campo}": {err.error}
                        </div>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}

          {/* PASO 2: VALIDANDO */}
          {step === 'validating' && (
            <div className="text-center py-8">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-[#39A900] mb-4" />
              <p className="text-lg font-semibold mb-2">Validando datos...</p>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {/* PASO 3: PROCESANDO */}
          {step === 'processing' && (
            <div className="text-center py-8">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-[#39A900] mb-4" />
              <p className="text-lg font-semibold mb-2">Creando horarios...</p>
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-gray-600 mt-2">Por favor espera, esto puede tomar unos momentos</p>
            </div>
          )}

          {/* PASO 4: RESULTADOS */}
          {step === 'results' && processResult && (
            <>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-600">{processResult.total}</p>
                  <p className="text-sm text-blue-800">Total procesados</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-600">{processResult.exitosos}</p>
                  <p className="text-sm text-green-800">Exitosos</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-red-600">{processResult.errores}</p>
                  <p className="text-sm text-red-800">Errores</p>
                </div>
              </div>

              {processResult.detalles.length > 0 && (
                <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
                  <p className="font-semibold mb-2">Detalle por fila:</p>
                  <div className="space-y-1 text-sm">
                    {processResult.detalles.map((detalle, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        {detalle.status === 'success' ? (
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                        )}
                        <span>
                          <strong>Fila {detalle.fila}:</strong> {detalle.mensaje}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {processResult.exitosos > 0 && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    ✅ Se crearon {processResult.exitosos} horarios exitosamente.
                  </AlertDescription>
                </Alert>
              )}

              {processResult.errores > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    ⚠️ {processResult.errores} horarios no pudieron ser creados. Revisa los errores arriba.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex-shrink-0 border-t pt-4 flex gap-2">
          {step === 'upload' && (
            <>
              <Button variant="outline" className="flex-1" onClick={handleClose}>
                Cancelar
              </Button>
              <Button 
                className="flex-1 bg-[#39A900] hover:bg-[#2d8000]" 
                onClick={handleValidateAndProcess}
                disabled={!file || loading}
              >
                <Upload className="mr-2 h-4 w-4" />
                Procesar Archivo
              </Button>
            </>
          )}

          {step === 'results' && (
            <>
              <Button variant="outline" className="flex-1" onClick={handleReset}>
                Subir Otro Archivo
              </Button>
              <Button className="flex-1 bg-[#39A900] hover:bg-[#2d8000]" onClick={handleClose}>
                Cerrar
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}