// ====================================================================
// HorarioCard.tsx - VERSIÓN FINAL LIMPIA
// ====================================================================
// Reemplaza COMPLETAMENTE tu archivo actual con este
// ====================================================================

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
      console.error('Error al cambiar estado:', error);
      alert(error.message || 'Error al cambiar estado del horario');
    } finally {
      setOperationLoading(false);
    }
  };

  return (
    <>
      <Card 
        className="border-l-4 hover:shadow-md transition-shadow h-full flex flex-col" 
        style={{ borderLeftColor: getTipoColor(horario.tipo) }}
      >
        <CardHeader className="pb-2 pt-3 px-3 flex-shrink-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              {horario.tipo === 'CLASE' && horario.apoyo && (
                <p className="text-sm font-bold text-[#00304D] mb-1 truncate">
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
                  <Badge className="text-xs py-0 px-2 bg-red-100 text-red-700">
                    Inactivo
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-2 pb-3 px-3 flex-1 flex flex-col">
          <div className="flex items-center gap-2 text-xs">
            <Clock className="h-3 w-3 text-[#39A900] flex-shrink-0" />
            <span className="font-medium">
              {horario.hora_inicio} - {horario.hora_fin}
            </span>
            <span className="text-gray-500 text-xs">
              ({horario.horas_semanales}h)
            </span>
          </div>

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
              {horario.ambiente_nombre && (
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Home className="h-3 w-3 text-[#39A900] flex-shrink-0" />
                  <span className="truncate">{horario.ambiente_codigo || horario.ambiente_nombre}</span>
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

          {filterMode === 'ambiente' && (
            <>
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

          <div className="pt-2 border-t text-xs text-gray-500">
            {new Date(horario.fecha_inicio).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })} - {new Date(horario.fecha_fin).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
          </div>

          <div className="pt-2 border-t flex flex-col gap-2 mt-auto">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 h-8 text-xs"
                onClick={() => onView(horario)}
              >
                <Eye className="h-3 w-3 mr-1" />
                Ver
              </Button>
              
              {canManage && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 h-8 text-xs"
                  onClick={() => onEdit(horario)}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Editar
                </Button>
              )}
            </div>

            {canManage && (
              <Button 
                variant="outline"
                size="sm"
                className={`w-full h-8 text-xs font-medium ${
                  horario.is_active 
                    ? "border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700" 
                    : "border-green-300 text-green-600 hover:bg-green-50 hover:text-green-700"
                }`}
                onClick={() => setDeleteDialogOpen(true)}
              >
                {horario.is_active ? (
                  <>
                    <UserX className="h-3 w-3 mr-1.5" />
                    Desactivar Horario
                  </>
                ) : (
                  <>
                    <UserCheck className="h-3 w-3 mr-1.5" />
                    Activar Horario
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {horario.is_active ? '¿Desactivar horario?' : '¿Activar horario?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {horario.is_active ? (
                <>
                  ¿Estás seguro de desactivar este horario?
                  <br />
                  <strong className="text-red-600">El horario dejará de estar visible.</strong>
                </>
              ) : (
                <>
                  ¿Estás seguro de activar este horario?
                  <br />
                  <strong className="text-green-600">El horario volverá a estar visible.</strong>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={operationLoading}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggleStatus}
              className={horario.is_active 
                ? "bg-red-600 hover:bg-red-700" 
                : "bg-[#39A900] hover:bg-[#2d8000]"
              }
              disabled={operationLoading}
            >
              {operationLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Procesando...
                </>
              ) : (
                horario.is_active ? 'Sí, Desactivar' : 'Sí, Activar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}