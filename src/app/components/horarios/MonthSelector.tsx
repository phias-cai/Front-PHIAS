// src/components/horarios/MonthSelector.tsx
import { useState, useEffect } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon } from "lucide-react";

interface MonthSelectorProps {
  selectedMonth: string; // YYYY-MM
  onMonthChange: (month: string) => void;
  horarios: any[];
  instructorNombre?: string;
}

// Nombres de meses en español
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// Mapeo de días de la semana
const DIA_SEMANA_MAP: { [key: string]: number } = {
  'DOMINGO': 0,
  'LUNES': 1,
  'MARTES': 2,
  'MIERCOLES': 3,
  'JUEVES': 4,
  'VIERNES': 5,
  'SABADO': 6
};

/**
 * Cuenta cuántas veces ocurre un día específico en un rango de fechas
 * Ejemplo: ¿Cuántos LUNES hay entre 2026-04-01 y 2026-04-30?
 */
function contarOcurrenciasDia(
  diaSemana: string,
  fechaInicio: Date,
  fechaFin: Date
): number {
  const diaNumero = DIA_SEMANA_MAP[diaSemana];
  if (diaNumero === undefined) {
    console.error('Día de semana inválido:', diaSemana);
    return 0;
  }

  let contador = 0;
  const fechaActual = new Date(fechaInicio);

  // Iterar cada día del rango
  while (fechaActual <= fechaFin) {
    if (fechaActual.getDay() === diaNumero) {
      contador++;
    }
    fechaActual.setDate(fechaActual.getDate() + 1);
  }

  return contador;
}

/**
 * Calcular horas del mes de forma PRECISA
 * Cuenta las ocurrencias reales de cada día en el mes
 */
function calculateMonthlyHours(horarios: any[], selectedMonth: string) {
  if (!selectedMonth || horarios.length === 0) {
    return {
      totalHoras: 0,
      horasClases: 0,
      horasApoyos: 0,
      horasReservas: 0,
      ocurrenciasPorDia: {}
    };
  }

  const [year, month] = selectedMonth.split('-').map(Number);
  const primerDiaMes = new Date(year, month - 1, 1);
  const ultimoDiaMes = new Date(year, month, 0);

  // Filtrar horarios que se cruzan con el mes
  const horariosDelMes = horarios.filter(h => {
    const fechaInicio = new Date(h.fecha_inicio);
    const fechaFin = new Date(h.fecha_fin);
    
    return fechaInicio <= ultimoDiaMes && fechaFin >= primerDiaMes;
  });

  let horasClases = 0;
  let horasApoyos = 0;
  let horasReservas = 0;
  const ocurrenciasPorDia: { [key: string]: number } = {};

  horariosDelMes.forEach(h => {
    const fechaInicioHorario = new Date(h.fecha_inicio);
    const fechaFinHorario = new Date(h.fecha_fin);

    // Determinar el rango efectivo (intersección con el mes)
    const fechaInicioEfectiva = fechaInicioHorario > primerDiaMes ? fechaInicioHorario : primerDiaMes;
    const fechaFinEfectiva = fechaFinHorario < ultimoDiaMes ? fechaFinHorario : ultimoDiaMes;

    // Contar cuántas veces ocurre este día en el mes
    const ocurrencias = contarOcurrenciasDia(
      h.dia_semana,
      fechaInicioEfectiva,
      fechaFinEfectiva
    );

    // Guardar para debug
    if (!ocurrenciasPorDia[h.dia_semana]) {
      ocurrenciasPorDia[h.dia_semana] = 0;
    }
    ocurrenciasPorDia[h.dia_semana] += ocurrencias;

    // Calcular horas totales para este horario en el mes
    const horasEnMes = h.horas_semanales * ocurrencias;
    
    if (h.tipo === 'CLASE') {
      horasClases += horasEnMes;
    } else if (h.tipo === 'APOYO') {
      horasApoyos += horasEnMes;
    } else if (h.tipo === 'RESERVA') {
      horasReservas += horasEnMes;
    }
  });

  return {
    totalHoras: horasClases + horasApoyos,
    horasClases,
    horasApoyos,
    horasReservas,
    ocurrenciasPorDia
  };
}

export function MonthSelector({ 
  selectedMonth, 
  onMonthChange, 
  horarios,
  instructorNombre 
}: MonthSelectorProps) {
  const [showPicker, setShowPicker] = useState(false);
  
  // Estado del picker
  const today = new Date();
  const [pickerYear, setPickerYear] = useState(today.getFullYear());
  const [pickerMonth, setPickerMonth] = useState(today.getMonth());

  // Sincronizar picker con selección actual
  useEffect(() => {
    if (selectedMonth) {
      const [year, month] = selectedMonth.split('-').map(Number);
      setPickerYear(year);
      setPickerMonth(month - 1);
    }
  }, [selectedMonth]);

  const stats = calculateMonthlyHours(horarios, selectedMonth);

  // Navegar años
  const handlePrevYear = () => {
    setPickerYear(pickerYear - 1);
  };

  const handleNextYear = () => {
    setPickerYear(pickerYear + 1);
  };

  // Seleccionar un mes
  const handleSelectMonth = (monthIndex: number) => {
    const newMonth = `${pickerYear}-${String(monthIndex + 1).padStart(2, '0')}`;
    onMonthChange(newMonth);
    setShowPicker(false);
  };

  // Limpiar selección
  const handleClear = () => {
    onMonthChange('');
    setShowPicker(false);
  };

  // Formato de visualización
  const displayMonth = selectedMonth 
    ? (() => {
        const [year, month] = selectedMonth.split('-').map(Number);
        return `${MESES[month - 1]} de ${year}`;
      })()
    : 'Selecciona un mes';

  // Verificar si un mes está seleccionado
  const isMonthSelected = (monthIndex: number) => {
    if (!selectedMonth) return false;
    const [year, month] = selectedMonth.split('-').map(Number);
    return year === pickerYear && month - 1 === monthIndex;
  };

  // Verificar si es el mes actual
  const isCurrentMonth = (monthIndex: number) => {
    const now = new Date();
    return now.getFullYear() === pickerYear && now.getMonth() === monthIndex;
  };

  // Resumen de ocurrencias para mostrar al usuario
  const ocurrenciasTexto = selectedMonth && Object.keys(stats.ocurrenciasPorDia).length > 0
    ? Object.entries(stats.ocurrenciasPorDia)
        .map(([dia, count]) => `${count} ${dia.toLowerCase()}${count !== 1 ? 's' : ''}`)
        .join(', ')
    : '';

  return (
    <div className="space-y-4">
      {/* Selector de Mes */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700 whitespace-nowrap flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-[#39A900]" />
          Mes:
        </label>
        
        <div className="relative flex-1 max-w-md">
          {/* Botón que abre el picker */}
          <button
            type="button"
            onClick={() => setShowPicker(!showPicker)}
            className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors hover:border-[#39A900] focus:outline-none focus:ring-2 focus:ring-[#39A900] focus:ring-offset-2"
          >
            <span className={!selectedMonth ? "text-gray-500" : ""}>
              {displayMonth}
            </span>
            <ChevronRight 
              className={`h-4 w-4 transition-transform text-gray-400 ${showPicker ? 'rotate-90' : ''}`}
            />
          </button>

          {/* Picker de Mes/Año */}
          {showPicker && (
            <div className="absolute top-12 left-0 z-50 w-[320px] bg-[#2c3e50] rounded-lg shadow-2xl border border-gray-700 p-4">
              {/* Header del Picker */}
              <div className="flex items-center justify-between mb-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handlePrevYear}
                  className="text-white hover:bg-white/10"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                
                <h3 className="text-white font-semibold text-lg">
                  {pickerYear}
                </h3>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleNextYear}
                  className="text-white hover:bg-white/10"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>

              {/* Grid de Meses (3 columnas) */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {MESES.map((mes, index) => {
                  const esMesActual = isCurrentMonth(index);
                  const estaSeleccionado = isMonthSelected(index);

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSelectMonth(index)}
                      className={`
                        px-3 py-2 rounded text-sm font-medium transition-all
                        ${estaSeleccionado 
                          ? 'bg-[#39A900] text-white ring-2 ring-white/50' 
                          : esMesActual
                            ? 'bg-[#4a5f7f] text-white ring-1 ring-cyan-400'
                            : 'bg-[#34495e] text-white hover:bg-[#3d5269]'
                        }
                      `}
                    >
                      {mes.substring(0, 3)}
                    </button>
                  );
                })}
              </div>

              {/* Botón Limpiar */}
              <div className="pt-3 border-t border-gray-600">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClear}
                  className="w-full text-white border-gray-600 hover:bg-white/10"
                >
                  Limpiar
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Botón Limpiar Externo */}
        {selectedMonth && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Estadísticas del Mes */}
      {selectedMonth && stats.totalHoras > 0 && (
        <Card className="bg-gradient-to-br from-[#39A900]/5 to-[#00304D]/5 border-[#39A900]/20">
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#00304D]">
                  📊 Total Horas en {displayMonth}
                </h3>
                <div className="text-3xl font-bold text-[#39A900]">
                  {stats.totalHoras.toFixed(1)}h
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-3 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#00304D]">
                    {stats.horasClases.toFixed(1)}h
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Clases</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#007832]">
                    {stats.horasApoyos.toFixed(1)}h
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Apoyos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-400">
                    {stats.horasReservas.toFixed(1)}h
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Reservas
                    <span className="block text-[10px]">(no cuenta)</span>
                  </div>
                </div>
              </div>

              {/* Desglose de días */}
              {ocurrenciasTexto && (
                <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
                  <span className="font-medium">📅 Días del mes:</span> {ocurrenciasTexto}
                </div>
              )}

              <div className="text-xs pt-2 border-t border-gray-200 flex items-center justify-between">
                <span className="text-gray-600">
                  {instructorNombre && (
                    <>👤 <span className="font-medium">{instructorNombre}</span></>
                  )}
                </span>
                <span className="text-[#39A900] font-semibold">
                  Total Laboral (Clases + Apoyos)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedMonth && stats.totalHoras === 0 && (
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-6 text-center text-gray-500">
            No hay horarios de clases o apoyos programados para {displayMonth}
          </CardContent>
        </Card>
      )}
    </div>
  );
}