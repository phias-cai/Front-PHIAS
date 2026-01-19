// src/components/horarios/ExportModal.tsx
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";
import { Download, Loader2, XCircle, Info } from "lucide-react";

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
  filterMode: 'ficha' | 'instructor' | 'ambiente';
  selectedId: string;
}

export function ExportModal({
  open,
  onClose,
  filterMode,
  selectedId,
}: ExportModalProps) {
  
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleExport = async () => {
    if (!fechaInicio || !fechaFin) {
      setError('Debes seleccionar ambas fechas');
      return;
    }

    if (fechaFin < fechaInicio) {
      setError('La fecha fin debe ser mayor a la fecha inicio');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Aquí iría la lógica de exportación a Excel
      // Por ahora solo simulo la descarga
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert('Exportación completada exitosamente (función pendiente de implementar)');
      onClose();
    } catch (err) {
      setError('Error al exportar los datos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Exportar Horarios a Excel</DialogTitle>
          <DialogDescription>
            Selecciona el rango de fechas para exportar
          </DialogDescription>
        </DialogHeader>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Se exportarán los horarios del filtro actual: <strong>{filterMode}</strong>
          </AlertDescription>
        </Alert>

        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fecha_inicio">Fecha Inicio</Label>
            <Input
              id="fecha_inicio"
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fecha_fin">Fecha Fin</Label>
            <Input
              id="fecha_fin"
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              className="flex-1 bg-[#39A900] hover:bg-[#2d8000]" 
              onClick={handleExport}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Exportar
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}