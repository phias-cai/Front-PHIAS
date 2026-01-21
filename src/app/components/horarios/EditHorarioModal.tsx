import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Alert, AlertDescription } from "../ui/alert";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

interface EditHorarioModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  horario: any | null;
}

const diasSemana = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];

export function EditHorarioModal({
  open,
  onClose,
  onSuccess,
  horario,
}: EditHorarioModalProps) {
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  
  const [formData, setFormData] = useState({
    fecha_inicio: '',
    fecha_fin: '',
    dia_semana: 'LUNES',
    hora_inicio: '',
    hora_fin: '',
    observaciones: '',
  });

  useEffect(() => {
    if (horario) {
      setFormData({
        fecha_inicio: horario.fecha_inicio,
        fecha_fin: horario.fecha_fin,
        dia_semana: horario.dia_semana,
        hora_inicio: horario.hora_inicio,
        hora_fin: horario.hora_fin,
        observaciones: horario.observaciones || '',
      });
      setResult(null);
    }
  }, [horario]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!horario) return;

    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.rpc('update_horario', {
        p_horario_id: horario.id,
        p_fecha_inicio: formData.fecha_inicio,
        p_fecha_fin: formData.fecha_fin,
        p_dia_semana: formData.dia_semana,
        p_hora_inicio: formData.hora_inicio,
        p_hora_fin: formData.hora_fin,
        p_observaciones: formData.observaciones || null,
      });

      if (error) throw error;

      const response = typeof data === 'string' ? JSON.parse(data) : data;

      if (response.success) {
        setResult({ success: true, message: 'Horario actualizado exitosamente' });
        onSuccess();
        setTimeout(() => {
          onClose();
          setResult(null);
        }, 2000);
      } else {
        throw new Error(response.error);
      }
    } catch (error: any) {
      setResult({ success: false, message: error.message || 'Error al actualizar horario' });
    } finally {
      setLoading(false);
    }
  };

  if (!horario) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-4 border-b">
          <DialogTitle>Editar Horario</DialogTitle>
          <DialogDescription>
            Modificar fechas, día y horas del horario
          </DialogDescription>
        </DialogHeader>

        {result && (
          <Alert variant={result.success ? 'default' : 'destructive'} className="flex-shrink-0">
            {result.success ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            <AlertDescription>{result.message}</AlertDescription>
          </Alert>
        )}

        {/* CONTENIDO CON SCROLL */}
        <div className="flex-1 overflow-y-auto px-1 py-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Info del horario (no editable) - Compacta */}
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Tipo:</span>
                  <span className="ml-2 text-gray-900">{horario.tipo}</span>
                </div>
                
                {horario.instructor_nombre && (
                  <div className="col-span-2">
                    <span className="font-medium text-gray-700">Instructor:</span>
                    <span className="ml-2 text-gray-900">{horario.instructor_nombre}</span>
                  </div>
                )}
                
                {horario.ficha_numero && horario.ficha_numero !== 'N/A' && (
                  <div>
                    <span className="font-medium text-gray-700">Ficha:</span>
                    <span className="ml-2 text-gray-900">{horario.ficha_numero}</span>
                  </div>
                )}
                
                {horario.ambiente_nombre && (
                  <div>
                    <span className="font-medium text-gray-700">Ambiente:</span>
                    <span className="ml-2 text-gray-900">{horario.ambiente_codigo || horario.ambiente_nombre}</span>
                  </div>
                )}
              </div>
              
              {/* Competencia con tooltip si es muy larga */}
              {horario.competencia_nombre && horario.competencia_nombre !== 'N/A' && (
                <div className="pt-2 border-t">
                  <span className="font-medium text-gray-700 text-sm">Competencia:</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="text-sm text-gray-900 mt-1 line-clamp-2 cursor-help">
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
            </div>

            {/* Campos editables */}
            <div className="space-y-2">
              <Label>Día de la Semana <span className="text-red-500">*</span></Label>
              <Select 
                value={formData.dia_semana} 
                onValueChange={(v) => setFormData({...formData, dia_semana: v})}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {diasSemana.map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hora Inicio <span className="text-red-500">*</span></Label>
                <Input 
                  type="time" 
                  required 
                  value={formData.hora_inicio} 
                  onChange={(e) => setFormData({...formData, hora_inicio: e.target.value})} 
                />
              </div>

              <div className="space-y-2">
                <Label>Hora Fin <span className="text-red-500">*</span></Label>
                <Input 
                  type="time" 
                  required 
                  value={formData.hora_fin} 
                  onChange={(e) => setFormData({...formData, hora_fin: e.target.value})} 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha Inicio <span className="text-red-500">*</span></Label>
                <Input 
                  type="date" 
                  required 
                  value={formData.fecha_inicio} 
                  onChange={(e) => setFormData({...formData, fecha_inicio: e.target.value})} 
                />
              </div>

              <div className="space-y-2">
                <Label>Fecha Fin <span className="text-red-500">*</span></Label>
                <Input 
                  type="date" 
                  required 
                  value={formData.fecha_fin} 
                  onChange={(e) => setFormData({...formData, fecha_fin: e.target.value})} 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Observaciones</Label>
              <Textarea 
                value={formData.observaciones} 
                onChange={(e) => setFormData({...formData, observaciones: e.target.value})} 
                rows={3}
                placeholder="Observaciones adicionales..."
              />
            </div>
          </form>
        </div>

        {/* FOOTER FIJO */}
        <DialogFooter className="flex-shrink-0 border-t pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            type="button"
            onClick={handleSubmit}
            className="bg-[#39A900] hover:bg-[#2d8000]" 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar Cambios'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}