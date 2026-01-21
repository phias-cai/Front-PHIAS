import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Clock, Users, Home, BookOpen, Target, Edit, Eye, UserX, UserCheck } from "lucide-react";
import { useState } from "react";
import { supabase } from "../../../lib/supabase";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { Loader2 } from "lucide-react";

interface HorarioCardProps {
  horario: any;
  filterMode: 'ficha' | 'instructor' | 'ambiente';
  getTipoColor: (tipo: string) => string;
  canManage: boolean;
  onUpdate: () => void;
  onView: (horario: any) => void;
  onEdit: (horario: any) => void;
}

export function HorarioCard({ 
  horario, 
  filterMode, 
  getTipoColor, 
  canManage,
  onUpdate,
  onView,
  onEdit 
}: HorarioCardProps) {
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [operationLoading, setOperationLoading] = useState(false);

  const handleToggleStatus = async () => {
    setOperationLoading(true);
    
    try {
      const functionName = horario.is_active 
        ? 'deactivate_horario' 
        : 'activate_horario';

      const { data, error } = await supabase.rpc(functionName, {
        p_horario_id: horario.id,
      });

      if (error) throw error;

      const response = typeof data === 'string' ? JSON.parse(data) : data;

      if (response.success) {
        onUpdate();
        setDeleteDialogOpen(false);
      } else {
        throw new Error(response.error || 'Error desconocido');
      }
    } catch (error: any) {
      alert(error.message || 'Error al cambiar estado del horario');
    } finally {
      setOperationLoading(false);
    }
  };

  return (
    <>
      <Card 
        className="border-l-4 hover:shadow-md transition-shadow" 
        style={{ borderLeftColor: getTipoColor(horario.tipo) }}
      >
        <CardHeader className="pb-2 pt-3 px-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Mostrar APOYO primero si es CLASE */}
              {horario.tipo === 'CLASE' && horario.apoyo && (
                <p className="text-sm font-bold text-[#00304D] mb-1 line-clamp-1">
                  📚 {horario.apoyo}
                </p>
              )}
              
              <CardTitle className="text-sm text-[#00304D] line-clamp-2">
                {horario.tipo === 'CLASE' && horario.competencia_nombre}
                {horario.tipo === 'APOYO' && `Apoyo: ${horario.apoyo_tipo}`}
                {horario.tipo === 'RESERVA' && 'Reserva de Ambiente'}
              </CardTitle>
              
              <div className="flex gap-2 flex-wrap mt-2">
                <Badge 
                  className="text-xs py-0 px-2" 
                  style={{ backgroundColor: getTipoColor(horario.tipo) }}
                >
                  {horario.tipo}
                </Badge>
                {!horario.is_active && (
                  <Badge className="text-xs py-0 px-2 bg-gray-500">Inactivo</Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-2 pb-3 px-3">
          {/* Horario */}
          <div className="flex items-center gap-2 text-xs">
            <Clock className="h-3 w-3 text-[#39A900] flex-shrink-0" />
            <span className="font-medium">
              {horario.hora_inicio} - {horario.hora_fin}
            </span>
            <span className="text-gray-500 text-xs">
              ({horario.horas_semanales}h)
            </span>
          </div>

          {/* Contenido según modo de filtro */}
          {filterMode === 'ficha' && (
            <>
              {horario.instructor_nombre && (
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Users className="h-3 w-3 text-[#39A900] flex-shrink-0" />
                  <span className="truncate">{horario.instructor_nombre}</span>
                </div>
              )}
              {horario.ambiente_nombre && (
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Home className="h-3 w-3 text-[#39A900] flex-shrink-0" />
                  <span className="truncate">{horario.ambiente_codigo || horario.ambiente_nombre}</span>
                </div>
              )}
              {horario.resultado_nombre && horario.resultado_nombre !== 'N/A' && (
                <div className="flex items-start gap-2 text-xs text-gray-600">
                  <Target className="h-3 w-3 text-[#39A900] mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-1">{horario.resultado_nombre}</span>
                </div>
              )}
            </>
          )}

          {filterMode === 'instructor' && (
            <>
              {horario.tipo === 'APOYO' && horario.apoyo_tipo && (
                <div className="text-xs text-gray-600 italic line-clamp-1">
                  {horario.apoyo_tipo}
                </div>
              )}
              {horario.ficha_numero && horario.ficha_numero !== 'N/A' && (
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <BookOpen className="h-3 w-3 text-[#39A900] flex-shrink-0" />
                  <span className="truncate">Ficha {horario.ficha_numero}</span>
                </div>
              )}
              {horario.ambiente_nombre && (
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Home className="h-3 w-3 text-[#39A900] flex-shrink-0" />
                  <span className="truncate">{horario.ambiente_codigo || horario.ambiente_nombre}</span>
                </div>
              )}
            </>
          )}

          {filterMode === 'ambiente' && (
            <>
              {(horario.tipo === 'APOYO' || horario.tipo === 'RESERVA') && (
                <div className="text-xs text-gray-600 italic line-clamp-1">
                  {horario.apoyo_tipo || horario.observacion_reserva}
                </div>
              )}
              {horario.instructor_nombre && (
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Users className="h-3 w-3 text-[#39A900] flex-shrink-0" />
                  <span className="truncate">{horario.instructor_nombre}</span>
                </div>
              )}
              {horario.ficha_numero && horario.ficha_numero !== 'N/A' && (
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <BookOpen className="h-3 w-3 text-[#39A900] flex-shrink-0" />
                  <span className="truncate">Ficha {horario.ficha_numero}</span>
                </div>
              )}
            </>
          )}

          {/* Fechas de vigencia */}
          <div className="pt-2 border-t text-xs text-gray-500">
            {new Date(horario.fecha_inicio).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })} - {new Date(horario.fecha_fin).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
          </div>

          {/* Botones de acción */}
          <div className="pt-2 border-t flex gap-1">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 h-7 text-xs"
              onClick={() => onView(horario)}
            >
              <Eye className="h-3 w-3 mr-1" />
              Ver
            </Button>
            
            {canManage && (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 h-7 text-xs"
                  onClick={() => onEdit(horario)}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Editar
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={`h-7 px-2 ${horario.is_active ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"}`}
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  {horario.is_active ? <UserX className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AlertDialog Desactivar/Activar */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {horario.is_active ? '¿Desactivar horario?' : '¿Activar horario?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {horario.is_active ? (
                <>¿Estás seguro de desactivar este horario? El horario dejará de estar visible.</>
              ) : (
                <>¿Estás seguro de activar este horario? El horario volverá a estar activo.</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggleStatus}
              className={horario.is_active ? "bg-red-600 hover:bg-red-700" : "bg-[#39A900] hover:bg-[#2d8000]"}
              disabled={operationLoading}
            >
              {operationLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                horario.is_active ? 'Desactivar' : 'Activar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}