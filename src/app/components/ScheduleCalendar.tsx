import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight, Clock, MapPin, Users, Calendar as CalendarIcon, Plus } from "lucide-react";
import { Badge } from "./ui/badge";
import { format, addDays, startOfWeek, addWeeks } from "date-fns";
import { es } from "date-fns/locale";

const scheduleData = [
  {
    id: 1,
    title: "Desarrollo Web",
    instructor: "Carlos Ramírez",
    ficha: "2559874",
    startTime: "08:00",
    endTime: "10:00",
    room: "Amb 201",
    day: 1,
    color: "#39A900"
  },
  {
    id: 2,
    title: "Base de Datos",
    instructor: "María González",
    ficha: "2445621",
    startTime: "10:00",
    endTime: "12:00",
    room: "Amb 305",
    day: 1,
    color: "#00304D"
  },
  {
    id: 3,
    title: "Programación POO",
    instructor: "Juan Pérez",
    ficha: "2559874",
    startTime: "14:00",
    endTime: "17:00",
    room: "Amb 201",
    day: 2,
    color: "#007832"
  },
  {
    id: 4,
    title: "Diseño UI/UX",
    instructor: "Ana Martínez",
    ficha: "2334455",
    startTime: "08:00",
    endTime: "11:00",
    room: "Amb 102",
    day: 3,
    color: "#71277A"
  },
  {
    id: 5,
    title: "Gestión de Proyectos",
    instructor: "Pedro López",
    ficha: "2445621",
    startTime: "13:00",
    endTime: "16:00",
    room: "Amb 405",
    day: 4,
    color: "#FDC300"
  },
  {
    id: 6,
    title: "Inglés Técnico",
    instructor: "Laura Sánchez",
    ficha: "2559874",
    startTime: "09:00",
    endTime: "11:00",
    room: "Amb 301",
    day: 5,
    color: "#50E5F9"
  },
];

const hours = [
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", 
  "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"
];

interface ScheduleCalendarProps {
  onOpenModal?: (modalType: string, data?: any) => void;
}

export function ScheduleCalendar({ onOpenModal }: ScheduleCalendarProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedSchedule, setSelectedSchedule] = useState<typeof scheduleData[0] | null>(null);

  const weekDays = Array.from({ length: 6 }, (_, i) => addDays(currentWeekStart, i));

  const goToPreviousWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, -1));
  };

  const goToNextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  };

  const goToToday = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  const calculateSchedulePosition = (schedule: typeof scheduleData[0]) => {
    const startHour = parseInt(schedule.startTime.split(":")[0]);
    const startMinute = parseInt(schedule.startTime.split(":")[1]);
    const endHour = parseInt(schedule.endTime.split(":")[0]);
    const endMinute = parseInt(schedule.endTime.split(":")[1]);
    
    const durationHours = (endHour - startHour) + (endMinute - startMinute) / 60;
    
    return {
      startHour,
      height: durationHours * 60, // 60px per hour
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#00304D]">Calendario de Horarios</h1>
          <p className="text-gray-600 mt-1">
            {format(currentWeekStart, "d 'de' MMMM", { locale: es })} - {format(addDays(currentWeekStart, 5), "d 'de' MMMM 'de' yyyy", { locale: es })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={goToPreviousWeek}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={goToToday}
          >
            Hoy
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={goToNextWeek}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button 
            className="ml-4 bg-[#39A900] hover:bg-[#2d8000]"
            onClick={() => onOpenModal?.('createSchedule')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Horario
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar Grid */}
        <Card className="lg:col-span-3">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Header */}
                <div className="grid grid-cols-7 border-b bg-[#00304D] sticky top-0 z-10">
                  <div className="p-3 text-white text-sm font-medium">Hora</div>
                  {weekDays.map((day, index) => (
                    <div key={index} className="p-3 text-white text-sm font-medium text-center border-l border-white/10">
                      <div>{format(day, "EEEE", { locale: es })}</div>
                      <div className="text-xs opacity-75">{format(day, "d MMM", { locale: es })}</div>
                    </div>
                  ))}
                </div>

                {/* Time slots */}
                <div className="relative">
                  {hours.map((hour, hourIndex) => (
                    <div key={hourIndex} className="grid grid-cols-7 border-b hover:bg-gray-50">
                      <div className="p-3 text-xs text-gray-500 font-medium h-[60px] flex items-start">
                        {hour}
                      </div>
                      {weekDays.map((_, dayIndex) => (
                        <div
                          key={dayIndex}
                          className="p-2 border-l h-[60px] relative"
                        >
                          {scheduleData
                            .filter(schedule => schedule.day === dayIndex)
                            .map(schedule => {
                              const { startHour, height } = calculateSchedulePosition(schedule);
                              if (startHour === parseInt(hour.split(":")[0])) {
                                return (
                                  <div
                                    key={schedule.id}
                                    className="absolute left-2 right-2 p-2 rounded cursor-pointer hover:opacity-90 transition-all shadow-sm"
                                    style={{ 
                                      backgroundColor: schedule.color + "20", 
                                      borderLeft: `3px solid ${schedule.color}`,
                                      height: `${height}px`,
                                      zIndex: 5
                                    }}
                                    onClick={() => setSelectedSchedule(schedule)}
                                  >
                                    <p className="text-xs font-semibold text-[#00304D] truncate">
                                      {schedule.title}
                                    </p>
                                    <p className="text-xs text-gray-600 truncate">
                                      {schedule.instructor}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {schedule.room}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                      {schedule.startTime} - {schedule.endTime}
                                    </p>
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

        {/* Details Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Detalles</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedSchedule ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-lg text-[#00304D] mb-2">
                    {selectedSchedule.title}
                  </h3>
                  <Badge style={{ backgroundColor: selectedSchedule.color }}>
                    Ficha {selectedSchedule.ficha}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-[#39A900] mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Instructor</p>
                      <p className="text-sm text-gray-600">{selectedSchedule.instructor}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-[#39A900] mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Horario</p>
                      <p className="text-sm text-gray-600">
                        {selectedSchedule.startTime} - {selectedSchedule.endTime}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-[#39A900] mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Ambiente</p>
                      <p className="text-sm text-gray-600">{selectedSchedule.room}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-2">
                  <Button 
                    className="w-full bg-[#39A900] hover:bg-[#2d8000]"
                    onClick={() => onOpenModal?.('editSchedule', selectedSchedule)}
                  >
                    Editar Horario
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => onOpenModal?.('viewSchedule', selectedSchedule)}
                  >
                    Ver Detalles Completos
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">
                  Selecciona un horario para ver los detalles
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Leyenda de Programas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {[
              { name: "Desarrollo Web", color: "#39A900" },
              { name: "Base de Datos", color: "#00304D" },
              { name: "Programación", color: "#007832" },
              { name: "Diseño", color: "#71277A" },
              { name: "Gestión", color: "#FDC300" },
              { name: "Idiomas", color: "#50E5F9" },
            ].map((program, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: program.color }}
                />
                <span className="text-sm text-gray-600">{program.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
