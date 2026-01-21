import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Clock, Users, Home, BookOpen, Target, Calendar, Edit, FileText } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

interface ViewHorarioModalProps {
  open: boolean;
  onClose: () => void;
  horario: any | null;
  onEdit: (horario: any) => void;
  canManage: boolean;
}

export function ViewHorarioModal({
  open,
  onClose,
  horario,
  onEdit,
  canManage,
}: ViewHorarioModalProps) {
  
  if (!horario) return null;

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'CLASE': return '#39A900';
      case 'APOYO': return '#00304D';
      case 'RESERVA': return '#71277A';
      default: return '#000000';
    }
  };

  const handleEdit = () => {
    onClose();
    onEdit(horario);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-4 border-b">
          <div className="flex items-center gap-3">
            <DialogTitle className="text-2xl">Detalles del Horario</DialogTitle>
            <Badge 
              className="text-xs" 
              style={{ backgroundColor: getTipoColor(horario.tipo) }}
            >
              {horario.tipo}
            </Badge>
          </div>
          <DialogDescription>
            Información completa del horario seleccionado
          </DialogDescription>
        </DialogHeader>

        {/* CONTENIDO CON SCROLL */}
        <div className="flex-1 overflow-y-auto px-1 py-4">
          <div className="space-y-6">
            {/* Horario */}
            <div className="space-y-3">
              <h3 className="font-semibold text-[#00304D] flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Horario
              </h3>
              <div className="grid grid-cols-2 gap-4 pl-6">
                <div>
                  <p className="text-sm text-gray-600">Día</p>
                  <p className="font-medium">{horario.dia_semana}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Horario</p>
                  <p className="font-medium">{horario.hora_inicio} - {horario.hora_fin}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Horas semanales</p>
                  <p className="font-medium">{horario.horas_semanales}h</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estado</p>
                  <Badge variant={horario.is_active ? "default" : "secondary"}>
                    {horario.is_active ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Vigencia */}
            <div className="space-y-3">
              <h3 className="font-semibold text-[#00304D] flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Vigencia
              </h3>
              <div className="grid grid-cols-2 gap-4 pl-6">
                <div>
                  <p className="text-sm text-gray-600">Fecha inicio</p>
                  <p className="font-medium">
                    {new Date(horario.fecha_inicio).toLocaleDateString('es-CO')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fecha fin</p>
                  <p className="font-medium">
                    {new Date(horario.fecha_fin).toLocaleDateString('es-CO')}
                  </p>
                </div>
              </div>
            </div>

            {/* Instructor */}
            {horario.instructor_nombre && (
              <div className="space-y-3">
                <h3 className="font-semibold text-[#00304D] flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Instructor
                </h3>
                <p className="pl-6">{horario.instructor_nombre}</p>
              </div>
            )}

            {/* Ambiente */}
            {horario.ambiente_nombre && (
              <div className="space-y-3">
                <h3 className="font-semibold text-[#00304D] flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Ambiente
                </h3>
                <p className="pl-6">
                  {horario.ambiente_codigo && `${horario.ambiente_codigo} - `}
                  {horario.ambiente_nombre}
                </p>
              </div>
            )}

            {/* Detalles según tipo */}
            {horario.tipo === 'CLASE' && (
              <>
                {horario.ficha_numero && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-[#00304D] flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Ficha
                    </h3>
                    <p className="pl-6">Ficha {horario.ficha_numero}</p>
                    {horario.programa_nombre && (
                      <p className="pl-6 text-sm text-gray-600">{horario.programa_nombre}</p>
                    )}
                  </div>
                )}

                {horario.competencia_nombre && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-[#00304D] flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Competencia
                    </h3>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <p className="pl-6 line-clamp-2 cursor-help text-sm">
                            {horario.competencia_nombre}
                          </p>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-md">
                          <p className="text-sm">{horario.competencia_nombre}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}

                {horario.resultado_nombre && horario.resultado_nombre !== 'N/A' && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-[#00304D] flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Resultado de Aprendizaje
                    </h3>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <p className="pl-6 line-clamp-3 cursor-help text-sm">
                            {horario.resultado_nombre}
                          </p>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-md">
                          <p className="text-sm">{horario.resultado_nombre}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}

                {horario.apoyo && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-[#00304D] flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Apoyo (Materia/Tema)
                    </h3>
                    <p className="pl-6">{horario.apoyo}</p>
                  </div>
                )}
              </>
            )}

            {horario.tipo === 'APOYO' && horario.apoyo_tipo && (
              <div className="space-y-3">
                <h3 className="font-semibold text-[#00304D] flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Tipo de Apoyo
                </h3>
                <p className="pl-6">{horario.apoyo_tipo}</p>
              </div>
            )}

            {horario.tipo === 'RESERVA' && horario.observacion_reserva && (
              <div className="space-y-3">
                <h3 className="font-semibold text-[#00304D] flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Motivo de Reserva
                </h3>
                <p className="pl-6">{horario.observacion_reserva}</p>
              </div>
            )}

            {/* Observaciones */}
            {horario.observaciones && (
              <div className="space-y-3">
                <h3 className="font-semibold text-[#00304D] flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Observaciones
                </h3>
                <p className="pl-6 text-sm text-gray-700">{horario.observaciones}</p>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER FIJO */}
        <DialogFooter className="flex-shrink-0 border-t pt-4 flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          {canManage && (
            <Button 
              className="bg-[#39A900] hover:bg-[#2d8000]"
              onClick={handleEdit}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar Horario
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}