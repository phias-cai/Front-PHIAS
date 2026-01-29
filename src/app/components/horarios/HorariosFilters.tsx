// src/components/horarios/HorariosFilters.tsx
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Users, BookOpen, Home } from "lucide-react";

interface HorariosFiltersProps {
  filterMode: 'ficha' | 'instructor' | 'ambiente';
  setFilterMode: (mode: 'ficha' | 'instructor' | 'ambiente') => void;
  selectedFicha: string;
  setSelectedFicha: (id: string) => void;
  selectedInstructor: string;
  setSelectedInstructor: (id: string) => void;
  selectedAmbiente: string;
  setSelectedAmbiente: (id: string) => void;
  fichas: any[];
  instructores: any[];
  ambientes: any[];
  userRole?: string;
  isAprendizUser?: boolean; // ← NUEVO: Flag para restricción
}

export function HorariosFilters({
  filterMode,
  setFilterMode,
  selectedFicha,
  setSelectedFicha,
  selectedInstructor,
  setSelectedInstructor,
  selectedAmbiente,
  setSelectedAmbiente,
  fichas,
  instructores,
  ambientes,
  userRole,
  isAprendizUser = false, // ← NUEVO: Por defecto false
}: HorariosFiltersProps) {
  
  const handleModeChange = (mode: 'ficha' | 'instructor' | 'ambiente') => {
    setFilterMode(mode);
    // Limpiar selecciones
    setSelectedFicha('');
    setSelectedInstructor('');
    setSelectedAmbiente('');
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Botones de modo */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filterMode === 'ficha' ? 'default' : 'outline'}
              onClick={() => handleModeChange('ficha')}
              className={filterMode === 'ficha' ? 'bg-[#39A900] hover:bg-[#2d8000]' : ''}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Por Ficha
            </Button>
            
            {/* ✅ RESTRICCIÓN: Ocultar botón "Por Instructor" para aprendiz@sena.edu.co */}
            {!isAprendizUser && (
              <Button
                variant={filterMode === 'instructor' ? 'default' : 'outline'}
                onClick={() => handleModeChange('instructor')}
                className={filterMode === 'instructor' ? 'bg-[#39A900] hover:bg-[#2d8000]' : ''}
              >
                <Users className="h-4 w-4 mr-2" />
                Por Instructor
              </Button>
            )}
            
            <Button
              variant={filterMode === 'ambiente' ? 'default' : 'outline'}
              onClick={() => handleModeChange('ambiente')}
              className={filterMode === 'ambiente' ? 'bg-[#39A900] hover:bg-[#2d8000]' : ''}
            >
              <Home className="h-4 w-4 mr-2" />
              Por Ambiente
            </Button>
          </div>

          {/* Select según modo */}
          <div className="max-w-md">
            {filterMode === 'ficha' && (
              <Select value={selectedFicha} onValueChange={setSelectedFicha}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una ficha" />
                </SelectTrigger>
                <SelectContent>
                  {fichas.map(ficha => (
                    <SelectItem key={ficha.id} value={ficha.id}>
                      Ficha {ficha.numero}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {filterMode === 'instructor' && !isAprendizUser && (
              <Select value={selectedInstructor} onValueChange={setSelectedInstructor}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un instructor" />
                </SelectTrigger>
                <SelectContent>
                  {instructores.map(instructor => (
                    <SelectItem key={instructor.id} value={instructor.id}>
                      {instructor.nombres}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {filterMode === 'ambiente' && (
              <Select value={selectedAmbiente} onValueChange={setSelectedAmbiente}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un ambiente" />
                </SelectTrigger>
                <SelectContent>
                  {ambientes.map(ambiente => (
                    <SelectItem key={ambiente.id} value={ambiente.id}>
                      {ambiente.codigo} - {ambiente.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}