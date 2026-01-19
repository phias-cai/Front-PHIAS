import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Clock, Users, Home, BookOpen, Target, Calendar, Edit, FileText } from "lucide-react";

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
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle className="text-lg">Detalles del Horario</DialogTitle>
            <Badge 
              className="text-xs" 
              style={{ backgroundColor: getTipoColor(horario.tipo) }}
            >
              {horario.tipo}
            </Badge>
            {!horario.is_active && (
              <Badge variant="secondary" className="text-xs">Inactivo</Badge>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          {/* Horario - Compacto en grid */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-xs text-gray-600">Día</p>
              <p className="font-medium">{horario.dia_semana}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Horario</p>
              <p className="font-medium">{horario.hora_inicio} - {horario.hora_fin}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Horas semanales</p>
              <p className="font-medium">{horario.horas_semanales}h</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Vigencia</p>
              <p className="font-medium text-xs">
                {new Date(horario.fecha_inicio).toLocaleDateString('es-CO', {day: '2-digit', month: '2-digit'})} - {new Date(horario.fecha_fin).toLocaleDateString('es-CO', {day: '2-digit', month: '2-digit', year: 'numeric'})}
              </p>
            </div>
          </div>

          {/* Instructor */}
          {horario.instructor_nombre && (
            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
              <Users className="h-4 w-4 text-blue-600 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-600">Instructor</p>
                <p className="font-medium">{horario.instructor_nombre}</p>
              </div>
            </div>
          )}

          {/* Ambiente */}
          {horario.ambiente_nombre && (
            <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
              <Home className="h-4 w-4 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-600">Ambiente</p>
                <p className="font-medium">
                  {horario.ambiente_codigo && `${horario.ambiente_codigo} - `}
                  {horario.ambiente_nombre}
                </p>
              </div>
            </div>
          )}

          {/* Detalles según tipo */}
          {horario.tipo === 'CLASE' && (
            <>
              {/* Apoyo/Materia - PRIMERO */}
              {horario.apoyo && (
                <div className="flex items-start gap-2 p-2 bg-purple-50 rounded">
                  <FileText className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-600">Apoyo (Materia/Tema)</p>
                    <p className="font-medium">{horario.apoyo}</p>
                  </div>
                </div>
              )}

              {horario.ficha_numero && (
                <div className="flex items-center gap-2 p-2 bg-orange-50 rounded">
                  <BookOpen className="h-4 w-4 text-orange-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-600">Ficha</p>
                    <p className="font-medium">Ficha {horario.ficha_numero}</p>
                    {horario.programa_nombre && (
                      <p className="text-xs text-gray-600 mt-0.5">{horario.programa_nombre}</p>
                    )}
                  </div>
                </div>
              )}

              {horario.competencia_nombre && (
                <div className="flex items-start gap-2 p-2 bg-indigo-50 rounded">
                  <Target className="h-4 w-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-600">Competencia</p>
                    <p className="font-medium text-sm leading-tight">{horario.competencia_nombre}</p>
                  </div>
                </div>
              )}

              {horario.resultado_nombre && horario.resultado_nombre !== 'N/A' && (
                <div className="flex items-start gap-2 p-2 bg-teal-50 rounded">
                  <Target className="h-4 w-4 text-teal-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-600">Resultado de Aprendizaje</p>
                    <p className="text-sm leading-tight">{horario.resultado_nombre}</p>
                  </div>
                </div>
              )}
            </>
          )}

          {horario.tipo === 'APOYO' && horario.apoyo_tipo && (
            <div className="flex items-start gap-2 p-2 bg-purple-50 rounded">
              <FileText className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-600">Tipo de Apoyo</p>
                <p className="font-medium">{horario.apoyo_tipo}</p>
              </div>
            </div>
          )}

          {horario.tipo === 'RESERVA' && horario.observacion_reserva && (
            <div className="flex items-start gap-2 p-2 bg-purple-50 rounded">
              <FileText className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-600">Motivo de Reserva</p>
                <p className="font-medium">{horario.observacion_reserva}</p>
              </div>
            </div>
          )}

          {/* Observaciones */}
          {horario.observaciones && (
            <div className="p-2 bg-gray-50 rounded">
              <p className="text-xs text-gray-600 mb-1">Observaciones</p>
              <p className="text-sm text-gray-700">{horario.observaciones}</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button variant="outline" onClick={onClose} size="sm">
            Cerrar
          </Button>
          {canManage && (
            <Button 
              className="bg-[#39A900] hover:bg-[#2d8000]"
              onClick={handleEdit}
              size="sm"
            >
              <Edit className="h-3 w-3 mr-1" />
              Editar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}