// src/components/horarios/UploadMassiveInstructorModal.tsx
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Button } from "../ui/button";
import { Alert, AlertDescription } from "../ui/alert";
import { Progress } from "../ui/progress";
import { Upload, Download, Loader2, CheckCircle, XCircle, AlertTriangle, FileSpreadsheet } from "lucide-react";
import * as XLSX from 'xlsx';

interface UploadMassiveInstructorModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedInstructor: string;
  instructorNombre: string;
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
  
  if (typeof value === 'string' && /^\d{1,2}:\d{2}/.test(value)) {
    return value.split(':').slice(0, 2).join(':');
  }
  
  if (typeof value === 'number') {
    const totalMinutes = Math.round(value * 24 * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }
  
  const strValue = String(value).trim();
  if (/^\d{1,2}:\d{2}/.test(strValue)) {
    return strValue.split(':').slice(0, 2).join(':');
  }
  
  return null;
};

export function UploadMassiveInstructorModal({
  open,
  onClose,
  onSuccess,
  selectedInstructor,
  instructorNombre,
}: UploadMassiveInstructorModalProps) {
  
  const [step, setStep] = useState<'upload' | 'validating' | 'processing' | 'results'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [processResult, setProcessResult] = useState<ProcessResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Datos de referencia
  const [fichas, setFichas] = useState<any[]>([]);
  const [ambientes, setAmbientes] = useState<any[]>([]);
  const [programasData, setProgramasData] = useState<any[]>([]);

  useEffect(() => {
    if (open && selectedInstructor) {
      loadReferenceData();
    }
  }, [open, selectedInstructor]);

  const loadReferenceData = async () => {
    try {
      // Cargar fichas activas
      const { data: fichasData } = await supabase
        .from('fichas')
        .select('id, numero, programa_id')
        .eq('is_active', true)
        .order('numero');
      
      setFichas(fichasData || []);

      // Cargar ambientes
      const { data: ambientesData } = await supabase
        .from('ambientes')
        .select('id, codigo, nombre, capacidad')
        .eq('is_active', true)
        .order('codigo');
      
      setAmbientes(ambientesData || []);

      // Cargar programas con sus competencias y resultados
      const { data: programas } = await supabase
        .from('programas')
        .select('id, nombre')
        .eq('is_active', true);

      if (programas) {
        const programasConDatos = await Promise.all(
          programas.map(async (prog) => {
            // Competencias del programa
            const { data: competencias } = await supabase
              .from('competencias')
              .select('id, numero, nombre')
              .eq('programa_id', prog.id)
              .eq('is_active', true)
              .order('orden');

            // Resultados de esas competencias
            let resultados: any[] = [];
            if (competencias && competencias.length > 0) {
              const compIds = competencias.map(c => c.id);
              const { data: res } = await supabase
                .from('resultados_aprendizaje')
                .select('id, competencia_id, nombre, orden')
                .in('competencia_id', compIds)
                .eq('is_active', true)
                .order('orden');
              
              resultados = res || [];
            }

            return {
              ...prog,
              competencias: competencias || [],
              resultados: resultados
            };
          })
        );

        setProgramasData(programasConDatos);
      }
    } catch (error) {
      console.error('Error loading reference data:', error);
    }
  };

  const handleDownloadTemplate = async () => {
    setLoading(true);
    
    try {
      // 🔧 CARGAR DATOS FRESCOS DIRECTAMENTE
      console.log('Cargando datos para plantilla...');
      
      // Cargar fichas activas
      const { data: fichasData } = await supabase
        .from('fichas')
        .select('id, numero, programa_id')
        .eq('is_active', true)
        .order('numero');
      
      const fichasActuales = fichasData || [];
      console.log('Fichas cargadas:', fichasActuales.length);

      // Cargar ambientes
      const { data: ambientesData } = await supabase
        .from('ambientes')
        .select('id, codigo, nombre, capacidad')
        .eq('is_active', true)
        .order('codigo');
      
      const ambientesActuales = ambientesData || [];
      console.log('Ambientes cargados:', ambientesActuales.length);

      // Cargar programas con sus competencias y resultados
      // 🔧 Solo seleccionamos columnas básicas que deben existir
      const { data: programas, error: programasError } = await supabase
        .from('programas')
        .select('id, nombre')
        .eq('is_active', true);

      if (programasError) {
        console.error('Error cargando programas:', programasError);
      }

      console.log('Programas cargados:', programas?.length || 0);

      const programasConDatos = [];
      
      if (programas) {
        for (const prog of programas) {
          console.log(`Cargando competencias para programa: ${prog.nombre} (${prog.id})`);
          
          // Competencias del programa
          const { data: competencias } = await supabase
            .from('competencias')
            .select('id, numero, nombre')
            .eq('programa_id', prog.id)
            .eq('is_active', true)
            .order('orden');

          console.log(`  - Competencias encontradas: ${competencias?.length || 0}`);

          // Resultados de esas competencias
          let resultados: any[] = [];
          if (competencias && competencias.length > 0) {
            const compIds = competencias.map(c => c.id);
            const { data: res } = await supabase
              .from('resultados_aprendizaje')
              .select('id, competencia_id, nombre, orden')
              .in('competencia_id', compIds)
              .eq('is_active', true)
              .order('orden');
            
            resultados = res || [];
            console.log(`  - Resultados encontrados: ${resultados.length}`);
          }

          programasConDatos.push({
            ...prog,
            competencias: competencias || [],
            resultados: resultados
          });
        }
      }

      console.log('Programas con datos:', programasConDatos.length);
      console.log('Detalle:', programasConDatos.map(p => ({
        nombre: p.nombre,
        competencias: p.competencias.length,
        resultados: p.resultados.length
      })));

      const wb = XLSX.utils.book_new();

      // ==========================================
      // HOJA 1: INSTRUCCIONES
      // ==========================================
      const instrucciones = [
        ['📚 PLANTILLA DE CARGA MASIVA - HORARIOS POR INSTRUCTOR'],
        [''],
        [`Instructor: ${instructorNombre}`],
        [''],
        ['📖 CÓMO USAR ESTA PLANTILLA'],
        [''],
        ['1. Complete SOLO la hoja "Horarios"'],
        ['2. En la columna "Tipo*" especifique: CLASE, APOYO o RESERVA'],
        ['3. Según el tipo, complete las columnas correspondientes:'],
        ['   • CLASE: requiere Ficha, Competencia, Resultado, Ambiente'],
        ['   • APOYO: requiere Tipo de Apoyo, Ambiente es opcional'],
        ['   • RESERVA: requiere Ambiente y Motivo'],
        ['4. Use formato de hora: HH:MM con apóstrofe (\'08:00, \'13:00)'],
        ['5. Use formato de fecha: DD/MM/AAAA (06/01/2026)'],
        ['6. Los campos marcados con * son obligatorios'],
        [''],
        ['⚠️ IMPORTANTE - FORMATO DE HORAS:'],
        ['Para evitar que Excel convierta las horas a decimal:'],
        ['• Escriba un apóstrofe antes: \'08:00, \'13:00, \'17:30'],
        ['• O cambie el formato de celda a TEXTO antes de escribir'],
        [''],
        ['📋 TIPOS DE HORARIO:'],
        ['CLASE - Horario de clase con ficha y competencia'],
        ['APOYO - Tutorías, asesorías, bienestar, etc.'],
        ['RESERVA - Reserva de ambiente para evento/reunión'],
        [''],
        ['💡 CONSEJOS:'],
        ['- Use las hojas de referencia para copiar códigos exactos'],
        ['- Puede dejar filas vacías entre horarios'],
        ['- El sistema valida conflictos automáticamente'],
      ];

      const wsInstrucciones = XLSX.utils.aoa_to_sheet(instrucciones);
      wsInstrucciones['!cols'] = [{ wch: 80 }];
      XLSX.utils.book_append_sheet(wb, wsInstrucciones, 'INSTRUCCIONES');

      // ==========================================
      // HOJA 2: HORARIOS (Para llenar)
      // ==========================================
      const horariosHeaders = [
        'Tipo*',
        'Día*',
        'Hora Inicio*',
        'Hora Fin*',
        'Ficha',
        'Competencia',
        'Resultado',
        'Ambiente*',
        'Apoyo/Tema',
        'Tipo Apoyo',
        'Motivo Reserva',
        'Fecha Inicio*',
        'Fecha Fin*',
        'Observaciones'
      ];

      const horariosEjemplos = [
        ['CLASE', 'LUNES', '\'08:00', '\'10:00', '2823654', '220501001', '01', 'CAD-A', 'Backend', '', '', '06/01/2026', '28/03/2026', ''],
        ['APOYO', 'MARTES', '\'14:00', '\'16:00', '', '', '', 'BIBLIO', '', 'Tutoría', '', '07/01/2026', '29/03/2026', 'Consultas de proyecto'],
        ['RESERVA', 'MIERCOLES', '\'09:00', '\'11:00', '', '', '', 'AUD-301', '', '', 'Reunión con empresa', '15/01/2026', '15/01/2026', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ];

      const wsHorarios = XLSX.utils.aoa_to_sheet([horariosHeaders, ...horariosEjemplos]);
      wsHorarios['!cols'] = [
        { wch: 10 },  // Tipo
        { wch: 12 },  // Día
        { wch: 12 },  // Hora Inicio
        { wch: 12 },  // Hora Fin
        { wch: 12 },  // Ficha
        { wch: 15 },  // Competencia
        { wch: 10 },  // Resultado
        { wch: 12 },  // Ambiente
        { wch: 20 },  // Apoyo/Tema
        { wch: 20 },  // Tipo Apoyo
        { wch: 25 },  // Motivo Reserva
        { wch: 15 },  // Fecha Inicio
        { wch: 15 },  // Fecha Fin
        { wch: 30 },  // Observaciones
      ];
      
      XLSX.utils.book_append_sheet(wb, wsHorarios, 'Horarios');

      // ==========================================
      // HOJA 3: FICHAS DISPONIBLES
      // ==========================================
      const fichasDataExcel = [
        ['Número Ficha', 'Programa'],
      ];

      for (const ficha of fichasActuales) {
        const programa = programasConDatos.find(p => p.id === ficha.programa_id);
        fichasDataExcel.push([
          ficha.numero,
          programa?.nombre || 'Sin programa asignado'
        ]);
      }

      console.log('Fichas para Excel:', fichasDataExcel.length - 1);

      const wsFichas = XLSX.utils.aoa_to_sheet(fichasDataExcel);
      wsFichas['!cols'] = [{ wch: 15 }, { wch: 50 }];
      XLSX.utils.book_append_sheet(wb, wsFichas, 'Fichas Disponibles');

      // ==========================================
      // HOJA 4: AMBIENTES DISPONIBLES
      // ==========================================
      const ambientesDataExcel = [
        ['Código', 'Nombre', 'Capacidad'],
        ...ambientesActuales.map(a => [a.codigo, a.nombre, a.capacidad || 'N/A'])
      ];

      const wsAmbientes = XLSX.utils.aoa_to_sheet(ambientesDataExcel);
      wsAmbientes['!cols'] = [{ wch: 15 }, { wch: 40 }, { wch: 12 }];
      XLSX.utils.book_append_sheet(wb, wsAmbientes, 'Ambientes Disponibles');

      // ==========================================
      // HOJA 5: COMPETENCIAS POR PROGRAMA
      // ==========================================
      const competenciasDataExcel = [
        ['Programa', 'Código Competencia', 'Nombre Competencia'],
      ];

      programasConDatos.forEach(prog => {
        prog.competencias.forEach((comp: any) => {
          competenciasDataExcel.push([
            prog.nombre,
            comp.numero,
            comp.nombre
          ]);
        });
      });

      console.log('Competencias para Excel:', competenciasDataExcel.length - 1);

      const wsCompetencias = XLSX.utils.aoa_to_sheet(competenciasDataExcel);
      wsCompetencias['!cols'] = [{ wch: 30 }, { wch: 20 }, { wch: 60 }];
      XLSX.utils.book_append_sheet(wb, wsCompetencias, 'Competencias por Programa');

      // ==========================================
      // HOJA 6: RESULTADOS POR COMPETENCIA
      // ==========================================
      const resultadosDataExcel = [
        ['Código Competencia', 'Número Resultado', 'Resultado de Aprendizaje'],
      ];

      programasConDatos.forEach(prog => {
        prog.competencias.forEach((comp: any) => {
          const resultadosComp = prog.resultados.filter((r: any) => r.competencia_id === comp.id);
          resultadosComp.forEach((r: any, index: number) => {
            resultadosDataExcel.push([
              comp.numero,
              String(index + 1).padStart(2, '0'),
              r.nombre
            ]);
          });
        });
      });

      console.log('Resultados para Excel:', resultadosDataExcel.length - 1);

      const wsResultados = XLSX.utils.aoa_to_sheet(resultadosDataExcel);
      wsResultados['!cols'] = [{ wch: 20 }, { wch: 18 }, { wch: 60 }];
      XLSX.utils.book_append_sheet(wb, wsResultados, 'Resultados por Competencia');

      // ==========================================
      // DESCARGAR
      // ==========================================
      const fileName = `Plantilla_Horarios_Instructor_${instructorNombre.replace(/\s+/g, '_')}.xlsx`;
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
      
      const worksheet = workbook.Sheets['Horarios'];
      if (!worksheet) {
        throw new Error('No se encontró la hoja "Horarios" en el archivo');
      }

      const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
      
      if (jsonData.length === 0) {
        throw new Error('El archivo no contiene datos');
      }

      setProgress(30);

      // Validar datos
      const errors: ValidationError[] = [];
      const horariosValidos: any[] = [];

      for (let i = 0; i < jsonData.length; i++) {
        const fila = i + 2;
        const row = jsonData[i];

        // Saltar filas vacías
        if (!row['Tipo*'] && !row['Día*']) continue;

        const horario: any = {};

        // Validar Tipo
        const tipo = String(row['Tipo*'] || '').trim().toUpperCase();
        const tiposValidos = ['CLASE', 'APOYO', 'RESERVA'];
        
        if (!tipo) {
          errors.push({ fila, campo: 'Tipo', error: 'Campo obligatorio' });
          continue; // Saltar esta fila
        } else if (!tiposValidos.includes(tipo)) {
          errors.push({ fila, campo: 'Tipo', error: `Debe ser: CLASE, APOYO o RESERVA` });
          continue;
        } else {
          horario.tipo = tipo;
        }

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
        const horaInicioRaw = row['Hora Inicio*'];
        const horaFinRaw = row['Hora Fin*'];
        
        const horaInicio = excelTimeToHHMM(horaInicioRaw);
        const horaFin = excelTimeToHHMM(horaFinRaw);
        
        if (!horaInicio) {
          errors.push({ fila, campo: 'Hora Inicio', error: `Campo obligatorio o formato inválido` });
        } else {
          const [h, m] = horaInicio.split(':');
          const hora = h.padStart(2, '0');
          const minuto = m.padStart(2, '0');
          
          if (parseInt(hora) > 23 || parseInt(minuto) > 59) {
            errors.push({ fila, campo: 'Hora Inicio', error: `Fuera de rango (00:00 a 23:59)` });
          } else {
            horario.hora_inicio = `${hora}:${minuto}:00`;
          }
        }

        if (!horaFin) {
          errors.push({ fila, campo: 'Hora Fin', error: `Campo obligatorio o formato inválido` });
        } else {
          const [h, m] = horaFin.split(':');
          const hora = h.padStart(2, '0');
          const minuto = m.padStart(2, '0');
          
          if (parseInt(hora) > 23 || parseInt(minuto) > 59) {
            errors.push({ fila, campo: 'Hora Fin', error: `Fuera de rango (00:00 a 23:59)` });
          } else {
            horario.hora_fin = `${hora}:${minuto}:00`;
          }
        }

        // Validar Fechas
        const fechaInicioStr = String(row['Fecha Inicio*'] || '').trim();
        const fechaFinStr = String(row['Fecha Fin*'] || '').trim();
        
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

        // Validaciones específicas según tipo
        if (tipo === 'CLASE') {
          // Validar Ficha
          const numFicha = String(row['Ficha'] || '').trim();
          if (!numFicha) {
            errors.push({ fila, campo: 'Ficha', error: 'Campo obligatorio para CLASE' });
          } else {
            const ficha = fichas.find(f => f.numero === numFicha);
            if (!ficha) {
              errors.push({ fila, campo: 'Ficha', error: `No se encontró ficha ${numFicha}` });
            } else {
              horario.ficha_id = ficha.id;
              horario.programa_id = ficha.programa_id;
            }
          }

          // Validar Competencia
          const numCompetencia = String(row['Competencia'] || '').trim();
          if (!numCompetencia) {
            errors.push({ fila, campo: 'Competencia', error: 'Campo obligatorio para CLASE' });
          } else if (horario.programa_id) {
            const programa = programasData.find(p => p.id === horario.programa_id);
            const competencia = programa?.competencias.find((c: any) => c.numero === numCompetencia);
            
            if (!competencia) {
              errors.push({ fila, campo: 'Competencia', error: `Competencia ${numCompetencia} no pertenece al programa` });
            } else {
              horario.competencia_id = competencia.id;
            }
          }

          // Validar Resultado
          const numResultado = String(row['Resultado'] || '').trim();
          if (!numResultado) {
            errors.push({ fila, campo: 'Resultado', error: 'Campo obligatorio para CLASE' });
          } else if (horario.competencia_id) {
            const programa = programasData.find(p => p.id === horario.programa_id);
            const resultadosComp = programa?.resultados.filter((r: any) => r.competencia_id === horario.competencia_id) || [];
            const resultadoIndex = parseInt(numResultado) - 1;
            
            if (resultadoIndex < 0 || resultadoIndex >= resultadosComp.length) {
              errors.push({ fila, campo: 'Resultado', error: `Número de resultado inválido` });
            } else {
              horario.resultado_id = resultadosComp[resultadoIndex].id;
            }
          }

          // Apoyo/Tema (opcional)
          horario.apoyo = String(row['Apoyo/Tema'] || '').trim() || null;

        } else if (tipo === 'APOYO') {
          // Validar Tipo Apoyo
          const tipoApoyo = String(row['Tipo Apoyo'] || '').trim();
          if (!tipoApoyo) {
            errors.push({ fila, campo: 'Tipo Apoyo', error: 'Campo obligatorio para APOYO' });
          } else {
            horario.apoyo_tipo = tipoApoyo;
          }

        } else if (tipo === 'RESERVA') {
          // Validar Motivo Reserva
          const motivo = String(row['Motivo Reserva'] || '').trim();
          if (!motivo) {
            errors.push({ fila, campo: 'Motivo Reserva', error: 'Campo obligatorio para RESERVA' });
          } else {
            horario.observacion_reserva = motivo;
          }
        }

        // Validar Ambiente (obligatorio para CLASE y RESERVA, opcional para APOYO)
        const codigoAmbiente = String(row['Ambiente*'] || '').trim();
        if (!codigoAmbiente && (tipo === 'CLASE' || tipo === 'RESERVA')) {
          errors.push({ fila, campo: 'Ambiente', error: `Campo obligatorio para ${tipo}` });
        } else if (codigoAmbiente) {
          const ambiente = ambientes.find(a => a.codigo === codigoAmbiente);
          if (!ambiente) {
            errors.push({ fila, campo: 'Ambiente', error: `No se encontró ambiente ${codigoAmbiente}` });
          } else {
            horario.ambiente_id = ambiente.id;
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
          let rpcFunction = '';
          let rpcParams: any = {
            p_instructor_id: selectedInstructor,
            p_fecha_inicio: horario.fecha_inicio,
            p_fecha_fin: horario.fecha_fin,
            p_dia_semana: horario.dia_semana,
            p_hora_inicio: horario.hora_inicio,
            p_hora_fin: horario.hora_fin,
            p_observaciones: horario.observaciones,
          };

          if (horario.tipo === 'CLASE') {
            rpcFunction = 'create_horario_clase';
            rpcParams = {
              ...rpcParams,
              p_ficha_id: horario.ficha_id,
              p_competencia_id: horario.competencia_id,
              p_resultado_id: horario.resultado_id,
              p_ambiente_id: horario.ambiente_id,
              p_apoyo: horario.apoyo,
            };
          } else if (horario.tipo === 'APOYO') {
            rpcFunction = 'create_horario_apoyo';
            rpcParams = {
              ...rpcParams,
              p_apoyo_tipo: horario.apoyo_tipo,
              p_ambiente_id: horario.ambiente_id || null,
            };
          } else if (horario.tipo === 'RESERVA') {
            rpcFunction = 'create_horario_reserva';
            rpcParams = {
              ...rpcParams,
              p_ambiente_id: horario.ambiente_id,
              p_observacion_reserva: horario.observacion_reserva,
            };
          }

          const { data, error } = await supabase.rpc(rpcFunction, rpcParams);

          if (error) throw error;

          const response = typeof data === 'string' ? JSON.parse(data) : data;

          if (response.success) {
            result.exitosos++;
            result.detalles.push({
              fila: horario.fila_original,
              status: 'success',
              mensaje: `Horario ${horario.tipo} creado exitosamente`
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
            Carga Masiva de Horarios - Instructor
          </DialogTitle>
          <DialogDescription>
            {instructorNombre}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1 py-4 space-y-4">
          
          {step === 'upload' && (
            <>
              <Alert>
                <FileSpreadsheet className="h-4 w-4" />
                <AlertDescription>
                  <strong>Paso 1:</strong> Descarga la plantilla Excel, complétala con tus horarios (CLASE, APOYO, RESERVA) y súbela aquí.
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

              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload-instructor"
                />
                <label htmlFor="file-upload-instructor" className="cursor-pointer">
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

              {validationErrors.length > 0 && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Se encontraron {validationErrors.length} errores:</strong>
                    <div className="mt-2 max-h-40 overflow-y-auto text-xs space-y-1">
                      {validationErrors.slice(0, 20).map((err, idx) => (
                        <div key={idx}>
                          • Fila {err.fila}, Campo "{err.campo}": {err.error}
                        </div>
                      ))}
                      {validationErrors.length > 20 && (
                        <div className="text-orange-600 font-semibold">
                          ... y {validationErrors.length - 20} errores más
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}

          {step === 'validating' && (
            <div className="text-center py-8">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-[#39A900] mb-4" />
              <p className="text-lg font-semibold mb-2">Validando datos...</p>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {step === 'processing' && (
            <div className="text-center py-8">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-[#39A900] mb-4" />
              <p className="text-lg font-semibold mb-2">Creando horarios...</p>
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-gray-600 mt-2">Por favor espera, esto puede tomar unos momentos</p>
            </div>
          )}

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