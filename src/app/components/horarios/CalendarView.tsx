import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, Users } from "lucide-react";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface CalendarViewProps {
  horarios: any[];
  getTipoColor: (tipo: string) => string;
  onView: (horario: any) => void;
  filterMode?: 'ficha' | 'instructor' | 'ambiente';
}


const diasSemana = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
const mesesNombres = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// Generar array de años (5 años hacia adelante)
function getYears() {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 5 }, (_, i) => currentYear + i);
}

// Función para parsear fechas de forma segura
function parseDate(dateString: string | null | undefined): Date | null {
  if (!dateString) return null;
  
  try {
    const date = new Date(dateString);
    
    // Verificar si es válida
    if (isNaN(date.getTime())) {
      console.error('Fecha inválida:', dateString);
      return null;
    }
    
    return date;
  } catch (error) {
    console.error('Error parseando fecha:', dateString, error);
    return null;
  }
}

// Calcular semana para un mes/año específico
function getWeekForDate(date: Date) {
  const startOfWeek = new Date(date);
  const day = startOfWeek.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Ajustar al lunes
  startOfWeek.setDate(date.getDate() + diff);
  
  const weekEnd = new Date(startOfWeek);
  weekEnd.setDate(startOfWeek.getDate() + 5); // Hasta sábado
  
  return {
    start: startOfWeek,
    end: weekEnd,
    label: `${startOfWeek.getDate()} ${startOfWeek.toLocaleDateString('es-CO', { month: 'short' })} - ${weekEnd.getDate()} ${weekEnd.toLocaleDateString('es-CO', { month: 'short' })}`
  };
}

export function CalendarView({ horarios, getTipoColor, onView, filterMode }: CalendarViewProps) {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  
  const currentWeek = getWeekForDate(currentDate);
  
  const hours = [
    "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", 
    "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", 
    "18:00", "19:00", "20:00","21:00", "22:00"
  ];

  // Filtrar horarios que aplican para la semana actual - CON PARSEO SEGURO
  const horariosEnSemana = horarios.filter(h => {
    const fechaInicio = parseDate(h.fecha_inicio);
    const fechaFin = parseDate(h.fecha_fin);
    
    // Si las fechas son inválidas, no mostrar el horario
    if (!fechaInicio || !fechaFin) {
      console.warn('⚠️ Horario con fechas inválidas:', {
        id: h.id,
        fecha_inicio: h.fecha_inicio,
        fecha_fin: h.fecha_fin,
        instructor: h.instructor_nombre
      });
      return false;
    }
    
    // Verificar que el horario esté vigente en la semana actual
    return fechaInicio <= currentWeek.end && fechaFin >= currentWeek.start;
  });

  const handlePrevWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
    setSelectedMonth(newDate.getMonth());
    setSelectedYear(newDate.getFullYear());
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
    setSelectedMonth(newDate.getMonth());
    setSelectedYear(newDate.getFullYear());
  };

  const handleGoToday = () => {
    const todayDate = new Date();
    setCurrentDate(todayDate);
    setSelectedMonth(todayDate.getMonth());
    setSelectedYear(todayDate.getFullYear());
  };

  const handleMonthChange = (month: string) => {
    const monthIndex = parseInt(month);
    setSelectedMonth(monthIndex);
    const newDate = new Date(selectedYear, monthIndex, 1);
    setCurrentDate(newDate);
  };

  const handleYearChange = (year: string) => {
    const yearNum = parseInt(year);
    setSelectedYear(yearNum);
    const newDate = new Date(yearNum, selectedMonth, 1);
    setCurrentDate(newDate);
  };

  // Función mejorada para calcular posición
  const calculatePosition = (horario: any) => {
    const [startHour, startMinute] = horario.hora_inicio.split(":").map(Number);
    const [endHour, endMinute] = horario.hora_fin.split(":").map(Number);
    
    const baseHour = 6;
    const topOffset = ((startHour - baseHour) * 60) + startMinute;
    const durationMinutes = ((endHour - startHour) * 60) + (endMinute - startMinute);
    
    return {
      top: topOffset,
      height: durationMinutes,
    };
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle className="text-lg">Vista Semanal</CardTitle>
          
          <div className="flex items-center gap-2 flex-wrap">
            {/* Selector de Mes */}
            <Select value={selectedMonth.toString()} onValueChange={handleMonthChange}>
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {mesesNombres.map((mes, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {mes}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Selector de Año */}
            <Select value={selectedYear.toString()} onValueChange={handleYearChange}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getYears().map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Navegación de semanas */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevWeek}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleGoToday}
                className="min-w-[80px]"
              >
                <CalendarIcon className="h-4 w-4 mr-1" />
                Hoy
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextWeek}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Mostrar rango de la semana */}
        <p className="text-sm text-gray-600 mt-2">
          {currentWeek.label}
        </p>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <div className="min-w-[1000px]">
            {/* Header con días */}
            <div className="grid grid-cols-7 border-b bg-[#00304D] sticky top-0 z-10">
              <div className="p-3 text-white text-sm font-medium">Hora</div>
              {diasSemana.map((dia, index) => (
                <div key={index} className="p-3 text-white text-sm font-medium text-center border-l border-white/10">
                  {dia}
                </div>
              ))}
            </div>

            {/* Grid de horarios - CONTENEDOR RELATIVO */}
            <div className="relative">
              {/* Filas de horas */}
              {hours.map((hour, hourIndex) => (
                <div key={hourIndex} className="grid grid-cols-7 border-b hover:bg-gray-50">
                  <div className="p-3 text-xs text-gray-500 font-medium h-[60px] flex items-start border-r">
                    {hour}
                  </div>
                  
                  {diasSemana.map((dia, dayIndex) => (
                    <div
                      key={dayIndex}
                      className="p-2 border-l h-[60px] relative"
                    />
                  ))}
                </div>
              ))}

              {/* CAPA ABSOLUTA PARA LOS HORARIOS */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="grid grid-cols-7 h-full">
                  {/* Primera columna vacía (para las horas) */}
                  <div />
                  
                  {/* Columnas para cada día */}
                  {diasSemana.map((dia, dayIndex) => (
                    <div key={dia} className="relative border-l pointer-events-auto">
                      {horariosEnSemana
                        .filter(h => h.dia_semana === dia)
                        .map(horario => {
                          const { top, height } = calculatePosition(horario);
                          
                          return (
                            <div
                              key={horario.id}
                              className="absolute left-1 right-1 p-1.5 rounded cursor-pointer hover:opacity-90 transition-all shadow-sm overflow-hidden text-xs"
                              style={{ 
                                backgroundColor: getTipoColor(horario.tipo) + "20", 
                                borderLeft: `3px solid ${getTipoColor(horario.tipo)}`,
                                top: `${top}px`,
                                height: `${height}px`,
                                zIndex: 5
                              }}
                              onClick={() => onView(horario)}
                            >
                              <div className="h-full overflow-hidden flex flex-col gap-0.5">
                                {/* ==================== MODO FICHA ==================== */}
                                {filterMode === 'ficha' && (
                                  <>
                                    {/* 1. APOYO - Si es tipo APOYO, mostrar con estilo destacado */}
                                    {horario.tipo === 'CLASE' && horario.apoyo && (
                                      <p className="text-[10px] font-bold text-[#2012eb] truncate leading-tight">
                                        📚 {horario.apoyo?.toUpperCase()}
                                      </p>
                                    )}
                                    
                                    {/* 2. INSTRUCTOR - Siempre visible */}
                                    {horario.instructor_nombre && (
                                      <div className="flex items-center gap-0.5 text-[9px] text-gray-600">
                                        <Users className="h-2.5 w-2.5 flex-shrink-0" />
                                        <span className="truncate">{horario.instructor_nombre}</span>
                                      </div>
                                    )}
                                    
                                    {/* 3. AMBIENTE - Si hay espacio */}
                                    {height >= 45 && horario.ambiente_nombre && (
                                      <div className="flex items-center gap-0.5 text-[9px] text-gray-500">
                                        <MapPin className="h-2.5 w-2.5 flex-shrink-0" />
                                        <span className="truncate">{horario.ambiente_codigo || horario.ambiente_nombre}</span>
                                      </div>
                                    )}
                                    
                                    {/* 4. COMPETENCIA - Solo CLASE, si hay espacio */}
                                    {height >= 60 && horario.tipo === 'CLASE' && horario.competencia_nombre && (
                                      <p className="text-[10px] font-semibold text-[#00304D] truncate leading-tight">
                                        {horario.competencia_nombre}
                                      </p>
                                    )}
                                    
                                    {/* 5. RESULTADO - Solo CLASE, si hay espacio */}
                                    {height >= 75 && horario.tipo === 'CLASE' && horario.resultado_nombre && horario.resultado_nombre !== 'N/A' && (
                                      <p className="text-[8px] text-gray-600 truncate">
                                        {horario.resultado_nombre}
                                      </p>
                                    )}
                                    
                                    {/* 6. HORARIO - Al final, si hay espacio */}
                                    {height >= 90 && (
                                      <div className="flex items-center gap-0.5 text-[9px] text-gray-400 mt-auto">
                                        <Clock className="h-2.5 w-2.5 flex-shrink-0" />
                                        <span className="truncate">{horario.hora_inicio.substring(0, 5)}</span>
                                      </div>
                                    )}
                                  </>
                                )}
                                
                                {/* ==================== MODO INSTRUCTOR ==================== */}
                                {filterMode === 'instructor' && (
                                  <>
                                  {(horario.tipo === 'CLASE' || horario.tipo === 'APOYO' || horario.tipo == 'RESERVA') && (
  <p className="text-[10px] font-bold text-[#2012eb] truncate leading-tight">
    {horario.tipo === 'CLASE' ? `📚 ${horario.apoyo?.toUpperCase()}` :  `📚 ${horario.tipo}`}
  </p>
)}
                                    {/* 2. FICHA - Siempre visible si existe */}
                                    {horario.ficha_numero && (
                                      <p className="text-[10px] font-semibold text-[#00304D] truncate leading-tight">
                                        📋 Ficha {horario.ficha_numero}
                                      </p>
                                    )}
                                    
                                    {/* 3. AMBIENTE - Si hay espacio */}
                                    {height >= 45 && horario.ambiente_nombre && (
                                      <div className="flex items-center gap-0.5 text-[9px] text-gray-500">
                                        <MapPin className="h-2.5 w-2.5 flex-shrink-0" />
                                        <span className="truncate">{horario.ambiente_codigo || horario.ambiente_nombre}</span>
                                      </div>
                                    )}
                                    
                                    {/* 4. COMPETENCIA - Solo CLASE, si hay espacio */}
                                    {height >= 60 && horario.tipo === 'CLASE' && horario.competencia_nombre && (
                                      <p className="text-[10px] font-semibold text-[#00304D] truncate leading-tight">
                                        {horario.competencia_nombre}
                                      </p>
                                    )}
                                    
                                    {/* 5. RESULTADO - Solo CLASE, si hay espacio */}
                                    {height >= 75 && horario.tipo === 'CLASE' && horario.resultado_nombre && horario.resultado_nombre !== 'N/A' && (
                                      <p className="text-[8px] text-gray-600 truncate">
                                        {horario.resultado_nombre}
                                      </p>
                                    )}
                                    
                                    {/* 6. HORARIO - Al final, si hay espacio */}
                                    {height >= 90 && (
                                      <div className="flex items-center gap-0.5 text-[9px] text-gray-400 mt-auto">
                                        <Clock className="h-2.5 w-2.5 flex-shrink-0" />
                                        <span className="truncate">{horario.hora_inicio.substring(0, 5)}</span>
                                      </div>
                                    )}
                                  </>
                                )}
                                
                                {/* ==================== MODO AMBIENTE ==================== */}
                                {filterMode === 'ambiente' && (
                                  <>
                                    {/* 1. TIPO - Siempre visible con color según tipo */}
                                    <p className="text-[10px] font-semibold truncate leading-tight"
                                       style={{ color: getTipoColor(horario.tipo) }}>
                                      {horario.tipo}
                                    </p>
                                    
                                    {/* 2. APOYO - Si es tipo APOYO, con estilo destacado */}
                                    {height >= 28 && horario.tipo === 'APOYO' && horario.apoyo && (
                                      <p className="text-[10px] font-bold text-[#2012eb] truncate leading-tight">
                                        📚 {horario.apoyo}
                                      </p>
                                    )}
                                    
                                    {/* 3. INSTRUCTOR - Si hay espacio */}
                                    {height >= 43 && horario.instructor_nombre && (
                                      <div className="flex items-center gap-0.5 text-[9px] text-gray-600">
                                        <Users className="h-2.5 w-2.5 flex-shrink-0" />
                                        <span className="truncate">{horario.instructor_nombre}</span>
                                      </div>
                                    )}
                                    
                                    {/* 4. FICHA - Si hay espacio */}
                                    {height >= 58 && horario.ficha_numero && (
                                      <p className="text-[10px] font-semibold text-[#00304D] truncate leading-tight">
                                        📋 Ficha {horario.ficha_numero}
                                      </p>
                                    )}
                                    
                                    {/* 5. COMPETENCIA - Solo CLASE, si hay espacio */}
                                    {height >= 73 && horario.tipo === 'CLASE' && horario.competencia_nombre && (
                                      <p className="text-[10px] font-semibold text-[#00304D] truncate leading-tight">
                                        {horario.competencia_nombre}
                                      </p>
                                    )}
                                    
                                    {/* 6. RESULTADO - Solo CLASE, si hay espacio */}
                                    {height >= 88 && horario.tipo === 'CLASE' && horario.resultado_nombre && horario.resultado_nombre !== 'N/A' && (
                                      <p className="text-[8px] text-gray-600 truncate">
                                        {horario.resultado_nombre}
                                      </p>
                                    )}
                                    
                                    {/* 7. HORARIO - Al final, si hay espacio */}
                                    {height >= 103 && (
                                      <div className="flex items-center gap-0.5 text-[9px] text-gray-400 mt-auto">
                                        <Clock className="h-2.5 w-2.5 flex-shrink-0" />
                                        <span className="truncate">{horario.hora_inicio.substring(0, 5)}</span>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}