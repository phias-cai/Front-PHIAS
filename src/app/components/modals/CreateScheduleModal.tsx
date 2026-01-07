import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Calendar, Clock } from "lucide-react";

interface CreateScheduleModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

export function CreateScheduleModal({ open, onClose, onSave }: CreateScheduleModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    instructor: "",
    ficha: "",
    environment: "",
    day: "",
    startTime: "",
    endTime: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
    setFormData({
      title: "",
      instructor: "",
      ficha: "",
      environment: "",
      day: "",
      startTime: "",
      endTime: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#00304D]">Crear Nuevo Horario</DialogTitle>
          <DialogDescription>
            Completa la información para programar una nueva clase
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Asignatura / Competencia</Label>
              <Input
                id="title"
                placeholder="Ej: Desarrollo Web"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ficha">Ficha</Label>
              <Select
                value={formData.ficha}
                onValueChange={(value) => setFormData({ ...formData, ficha: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar ficha" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2559874">2559874 - Análisis y Desarrollo</SelectItem>
                  <SelectItem value="2445621">2445621 - Gestión de BD</SelectItem>
                  <SelectItem value="2334455">2334455 - Diseño Gráfico</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructor">Instructor</Label>
              <Select
                value={formData.instructor}
                onValueChange={(value) => setFormData({ ...formData, instructor: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar instructor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Carlos Ramírez">Carlos Ramírez</SelectItem>
                  <SelectItem value="María González">María González</SelectItem>
                  <SelectItem value="Juan Pérez">Juan Pérez</SelectItem>
                  <SelectItem value="Ana Martínez">Ana Martínez</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="environment">Ambiente</Label>
              <Select
                value={formData.environment}
                onValueChange={(value) => setFormData({ ...formData, environment: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar ambiente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AMB-201">AMB-201 - Lab. Sistemas</SelectItem>
                  <SelectItem value="AMB-305">AMB-305 - Lab. Redes</SelectItem>
                  <SelectItem value="AMB-102">AMB-102 - Taller Diseño</SelectItem>
                  <SelectItem value="AMB-405">AMB-405 - Aula de Clase</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="day">Día</Label>
              <Select
                value={formData.day}
                onValueChange={(value) => setFormData({ ...formData, day: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar día" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Lunes</SelectItem>
                  <SelectItem value="1">Martes</SelectItem>
                  <SelectItem value="2">Miércoles</SelectItem>
                  <SelectItem value="3">Jueves</SelectItem>
                  <SelectItem value="4">Viernes</SelectItem>
                  <SelectItem value="5">Sábado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Hora</Label>
              <div className="flex gap-2">
                <Input
                  type="time"
                  placeholder="Inicio"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  required
                />
                <Input
                  type="time"
                  placeholder="Fin"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-[#39A900] hover:bg-[#2d8000]">
              Crear Horario
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
