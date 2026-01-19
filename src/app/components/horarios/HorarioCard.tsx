import { Card, CardContent, CardHeader } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Clock, Users, Home, BookOpen, Target, Edit, UserX, UserCheck, Eye } from "lucide-react";
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
  onEdit: (horario: any) => void;
  onView: (horario: any) => void;
}

export function HorarioCard({ 
  horario, 
  filterMode, 
  getTipoColor, 
  canManage,
  onUpdate,
  onEdit,
  onView
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
        className="border-l-4 hover:shadow-md transition-shadow cursor-pointer" 
        style={{ borderLeftColor: getTipoColor(horario.tipo) }}
        onClick={() => onView(horario)}
      >
        <CardHeader className="pb-2 px-3 pt-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-[#00304D] mb-1 line-clamp-2 leading-tight">
                {horario.tipo === 'CLASE' && (horario.apoyo || horario.competencia_nombre)}
                {horario.tipo === 'APOYO' && `Apoyo: ${horario.apoyo_tipo}`}
                {horario.tipo === 'RESERVA' && 'Reserva de Ambiente'}
              </h3>
              <div className="flex gap-1.5 flex-wrap">
                <Badge 
                  className="text-xs px-1.5 py-0" 
                  style={{ backgroundColor: getTipoColor(horario.tipo) }}
                >
                  {horario.tipo}
                </Badge>
                {!horario.is_active && (
                  <Badge className="text-xs px-1.5 py-0 bg-gray-500">Inactivo</Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-2 px-3 pb-3">
          {/* Horario */}
          <div className="flex items-center gap-1.5 text-xs">
            <Clock className="h-3 w-3 text-[#39A900] flex-shrink-0" />
            <span className="font-medium">
              {horario.hora_inicio} - {horario.hora_fin}
            </span>
            <span className="text-gray-500">
              ({horario.horas_semanales}h)
            </span>
          </div>

          {/* Contenido según modo de filtro */}
          {filterMode === 'ficha' && (
            <>
              {horario.instructor_nombre && (
                <div className="flex items-center gap-1.5 text-xs text-gray-600 truncate">
                  <Users className="h-3 w-3 text-[#39A900] flex-shrink-0" />
                  <span className="truncate">{horario.instructor_nombre}</span>
                </div>
              )}
              {horario.ambiente_nombre && (
                <div className="flex items-center gap-1.5 text-xs text-gray-600 truncate">
                  <Home className="h-3 w-3 text-[#39A900] flex-shrink-0" />
                  <span className="truncate">{horario.ambiente_codigo || horario.ambiente_nombre}</span>
                </div>
              )}
            </>
          )}

          {filterMode === 'instructor' && (
            <>
              {horario.ficha_numero && horario.ficha_numero !== 'N/A' && (
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                  <BookOpen className="h-3 w-3 text-[#39A900] flex-shrink-0" />
                  <span>Ficha {horario.ficha_numero}</span>
                </div>
              )}
              {horario.ambiente_nombre && (
                <div className="flex items-center gap-1.5 text-xs text-gray-600 truncate">
                  <Home className="h-3 w-3 text-[#39A900] flex-shrink-0" />
                  <span className="truncate">{horario.ambiente_codigo || horario.ambiente_nombre}</span>
                </div>
              )}
            </>
          )}

          {filterMode === 'ambiente' && (
            <>
              {horario.instructor_nombre && (
                <div className="flex items-center gap-1.5 text-xs text-gray-600 truncate">
                  <Users className="h-3 w-3 text-[#39A900] flex-shrink-0" />
                  <span className="truncate">{horario.instructor_nombre}</span>
                </div>
              )}
              {horario.ficha_numero && horario.ficha_numero !== 'N/A' && (
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                  <BookOpen className="h-3 w-3 text-[#39A900] flex-shrink-0" />
                  <span>Ficha {horario.ficha_numero}</span>
                </div>
              )}
            </>
          )}

          {/* Fechas de vigencia - más compacto */}
          <div className="pt-1.5 border-t text-xs text-gray-500">
            {new Date(horario.fecha_inicio).toLocaleDateString('es-CO', {day: '2-digit', month: '2-digit'})} - {new Date(horario.fecha_fin).toLocaleDateString('es-CO', {day: '2-digit', month: '2-digit', year: '2-digit'})}
          </div>

          {/* Botones de acción */}
          {canManage && (
            <div className="pt-1.5 border-t flex gap-1.5">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 h-7 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(horario);
                }}
              >
                <Edit className="h-3 w-3 mr-1" />
                Editar
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className={`h-7 text-xs ${horario.is_active ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteDialogOpen(true);
                }}
              >
                {horario.is_active ? (
                  <UserX className="h-3 w-3" />
                ) : (
                  <UserCheck className="h-3 w-3" />
                )}
              </Button>
            </div>
          )}
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
                <>
                  ¿Estás seguro de desactivar este horario? El horario dejará de estar visible.
                </>
              ) : (
                <>
                  ¿Estás seguro de activar este horario? El horario volverá a estar activo.
                </>
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