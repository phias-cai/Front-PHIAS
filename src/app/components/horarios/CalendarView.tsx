import { Card, CardContent } from "../ui/card";
import { Clock, MapPin, Users, BookOpen } from "lucide-react";
import { Badge } from "../ui/badge";

interface CalendarViewProps {
  horarios: any[];
  getTipoColor: (tipo: string) => string;
  onView: (horario: any) => void;
}

const hours = [
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", 
  "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
];

const diasSemana = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];

export function CalendarView({ horarios, getTipoColor, onView }: CalendarViewProps) {
  
  const calculateSchedulePosition = (horario: any) => {
    const [startHour, startMinute] = horario.hora_inicio.split(":").map(Number);
    const [endHour, endMinute] = horario.hora_fin.split(":").map(Number);
    
    const durationHours = (endHour - startHour) + (endMinute - startMinute) / 60;
    const startMinuteOffset = startMinute / 60;
    
    return {
      startHour,
      startMinuteOffset,
      height: durationHours * 60, // 60px per hour
      top: startMinuteOffset * 60, // Offset for minutes
    };
  };

  const getDayIndex = (dia: string) => {
    return diasSemana.indexOf(dia);
  };

  // Agrupar horarios por día
  const horariosPorDia = diasSemana.map(dia => ({
    dia,
    horarios: horarios.filter(h => h.dia_semana === dia)
  }));

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <div className="min-w-[1000px]">
            {/* Header */}
            <div className="grid grid-cols-7 border-b bg-[#00304D] sticky top-0 z-10">
              <div className="p-3 text-white text-sm font-medium">Hora</div>
              {diasSemana.map((dia, index) => (
                <div key={index} className="p-3 text-white text-sm font-medium text-center border-l border-white/10">
                  {dia}
                </div>
              ))}
            </div>

            {/* Time slots */}
            <div className="relative">
              {hours.map((hour, hourIndex) => (
                <div key={hourIndex} className="grid grid-cols-7 border-b hover:bg-gray-50">
                  <div className="p-3 text-xs text-gray-500 font-medium h-[60px] flex items-start border-r">
                    {hour}
                  </div>
                  
                  {horariosPorDia.map((diaData, dayIndex) => (
                    <div
                      key={dayIndex}
                      className="border-l h-[60px] relative"
                    >
                      {diaData.horarios.map(horario => {
                        const { startHour, height, top } = calculateSchedulePosition(horario);
                        
                        // Solo renderizar si este horario comienza en esta hora
                        if (startHour === parseInt(hour.split(":")[0])) {
                          return (
                            <div
                              key={horario.id}
                              className="absolute left-1 right-1 p-1.5 rounded cursor-pointer hover:opacity-90 transition-all shadow-sm overflow-hidden"
                              style={{ 
                                backgroundColor: getTipoColor(horario.tipo) + "20", 
                                borderLeft: `3px solid ${getTipoColor(horario.tipo)}`,
                                height: `${height}px`,
                                top: `${top}px`,
                                zIndex: 5
                              }}
                              onClick={() => onView(horario)}
                            >
                              <div className="space-y-0.5">
                                <p className="text-xs font-semibold text-[#00304D] truncate">
                                  {horario.tipo === 'CLASE' && (horario.apoyo || horario.competencia_nombre)}
                                  {horario.tipo === 'APOYO' && horario.apoyo_tipo}
                                  {horario.tipo === 'RESERVA' && 'Reserva'}
                                </p>
                                
                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                  <Users className="h-3 w-3 flex-shrink-0" />
                                  <span className="truncate">{horario.instructor_nombre}</span>
                                </div>
                                
                                {horario.ambiente_nombre && (
                                  <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <MapPin className="h-3 w-3 flex-shrink-0" />
                                    <span className="truncate">{horario.ambiente_codigo || horario.ambiente_nombre}</span>
                                  </div>
                                )}
                                
                                {horario.ficha_numero && horario.ficha_numero !== 'N/A' && (
                                  <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <BookOpen className="h-3 w-3 flex-shrink-0" />
                                    <span className="truncate">{horario.ficha_numero}</span>
                                  </div>
                                )}
                                
                                <p className="text-xs text-gray-400 mt-0.5">
                                  {horario.hora_inicio} - {horario.hora_fin}
                                </p>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}