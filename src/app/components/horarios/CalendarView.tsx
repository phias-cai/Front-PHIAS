import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight, Clock, MapPin, Users, BookOpen } from "lucide-react";
import { Badge } from "../ui/badge";



interface CalendarViewProps {
  horarios: any[];
  getTipoColor: (tipo: string) => string;
  onView: (horario: any) => void;
  filterMode?: 'ficha' | 'instructor' | 'ambiente';
}

const diasSemana = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];

// Generar array de semanas desde hoy hasta 3 meses adelante
function getWeeks() {
  const weeks = [];
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Lunes de esta semana
  
  for (let i = 0; i < 12; i++) {
    const weekStart = new Date(startOfWeek);
    weekStart.setDate(startOfWeek.getDate() + (i * 7));
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 5); // Hasta sábado
    
    weeks.push({
      start: weekStart,
      end: weekEnd,
      label: `${weekStart.getDate()} ${weekStart.toLocaleDateString('es-CO', { month: 'short' })} - ${weekEnd.getDate()} ${weekEnd.toLocaleDateString('es-CO', { month: 'short' })}`
    });
  }
  
  return weeks;
}

export function CalendarView({ horarios, getTipoColor, onView, filterMode }: CalendarViewProps) {
  const weeks = getWeeks();
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const currentWeek = weeks[currentWeekIndex];
  
  const hours = [
    "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", 
    "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", 
    "18:00", "19:00", "20:00"
  ];

  // Filtrar horarios que aplican para la semana actual
  const horariosEnSemana = horarios.filter(h => {
    const fechaInicio = new Date(h.fecha_inicio);
    const fechaFin = new Date(h.fecha_fin);
    return fechaInicio <= currentWeek.end && fechaFin >= currentWeek.start;
  });

  const handlePrevWeek = () => {
    if (currentWeekIndex > 0) {
      setCurrentWeekIndex(currentWeekIndex - 1);
    }
  };

  const handleNextWeek = () => {
    if (currentWeekIndex < weeks.length - 1) {
      setCurrentWeekIndex(currentWeekIndex + 1);
    }
  };

  // Función mejorada para calcular posición
  const calculatePosition = (horario: any) => {
    const [startHour, startMinute] = horario.hora_inicio.split(":").map(Number);
    const [endHour, endMinute] = horario.hora_fin.split(":").map(Number);
    
    // Calcular posición desde las 06:00 (primera hora del grid)
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
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Vista Semanal</CardTitle>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevWeek}
              disabled={currentWeekIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[200px] text-center">
              {currentWeek.label}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextWeek}
              disabled={currentWeekIndex === weeks.length - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
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

              {/* CAPA ABSOLUTA PARA LOS HORARIOS - ESTO ES CLAVE */}
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
                                {/* Apoyo o Título - Solo si hay espacio */}
                                {height >= 50 && horario.tipo === 'CLASE' && horario.apoyo && (
                                  <p className="text-[10px] font-bold text-[#00304D] truncate leading-tight">
                                    📚 {horario.apoyo}
                                  </p>
                                )}
                                
                                {/* Competencia o tipo - Siempre visible */}
                                <p className="text-[10px] font-semibold text-[#00304D] truncate leading-tight">
                                  {horario.tipo === 'CLASE' && horario.competencia_nombre}
                                  {horario.tipo === 'APOYO' && horario.apoyo_tipo}
                                  {horario.tipo === 'RESERVA' && 'Reserva'}
                                </p>
                                
                                {/* Instructor - Solo si hay espacio */}
                                {height >= 45 && (
                                  <div className="flex items-center gap-0.5 text-[9px] text-gray-600">
                                    <Users className="h-2.5 w-2.5 flex-shrink-0" />
                                    <span className="truncate">{horario.instructor_nombre}</span>
                                  </div>
                                )}
                                
                                {/* Ambiente - Solo si hay espacio */}
                                {height >= 60 && horario.ambiente_nombre && (
                                  <div className="flex items-center gap-0.5 text-[9px] text-gray-500">
                                    <MapPin className="h-2.5 w-2.5 flex-shrink-0" />
                                    <span className="truncate">{horario.ambiente_codigo || horario.ambiente_nombre}</span>
                                  </div>
                                )}
                                
                                {/* Horario - Siempre al final si hay espacio */}
                                {height >= 35 && (
                                  <div className="flex items-center gap-0.5 text-[9px] text-gray-400 mt-auto">
                                    <Clock className="h-2.5 w-2.5 flex-shrink-0" />
                                    <span className="truncate">{horario.hora_inicio.substring(0, 5)}</span>
                                  </div>
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