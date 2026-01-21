// src/components/Horarios.tsx
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Loader2, Plus, Download, Calendar as CalendarIcon, List } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { HorariosFilters } from "./horarios/HorariosFilters";
import { CreateHorarioModal } from "./horarios/CreateHorarioModal";
import { ViewHorarioModal } from "./horarios/ViewHorarioModal";
import { EditHorarioModal } from "./horarios/EditHorarioModal";
import { HorarioCard } from "./horarios/HorarioCard";
import { CalendarView } from "./horarios/CalendarView";
import { ExportModal } from "./horarios/ExportModal";

interface HorarioData {
  id: string;
  tipo: 'CLASE' | 'APOYO' | 'RESERVA';
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
  fecha_inicio: string;
  fecha_fin: string;
  horas_semanales: number;
  is_active: boolean;
  apoyo?: string;  // ⬅️ NUEVO
  
  instructor_id: string;
  instructor_nombre: string;
  ambiente_id?: string;
  ambiente_nombre?: string;
  ambiente_codigo?: string;
  ficha_id?: string;
  ficha_numero?: string;
  programa_nombre?: string;
  competencia_id?: string;
  competencia_nombre?: string;
  resultado_id?: string;
  resultado_nombre?: string;
  apoyo_tipo?: string;
  observacion_reserva?: string;
  observaciones?: string;
}

type FilterMode = 'ficha' | 'instructor' | 'ambiente';
type ViewMode = 'calendar' | 'list';

export function Horarios() {
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [horarios, setHorarios] = useState<HorarioData[]>([]);
  
  // Vista
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  
  // Filtros
  const [filterMode, setFilterMode] = useState<FilterMode>('ficha');
  const [selectedFicha, setSelectedFicha] = useState<string>('');
  const [selectedInstructor, setSelectedInstructor] = useState<string>('');
  const [selectedAmbiente, setSelectedAmbiente] = useState<string>('');
  
  // Modales
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);  // ⬅️ NUEVO
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [selectedHorario, setSelectedHorario] = useState<HorarioData | null>(null);
  
  // Opciones para filtros
  const [fichas, setFichas] = useState<any[]>([]);
  const [instructores, setInstructores] = useState<any[]>([]);
  const [ambientes, setAmbientes] = useState<any[]>([]);

  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    loadHorarios();
  }, [filterMode, selectedFicha, selectedInstructor, selectedAmbiente]);

  const loadFilterOptions = async () => {
    try {
      const { data: fichasData } = await supabase
        .from('fichas')
        .select('id, numero, programa_id')
        .eq('is_active', true)
        .order('numero');
      setFichas(fichasData || []);

      const { data: instructoresData } = await supabase
        .from('profiles')
        .select('id, nombres')
        .eq('rol', 'instructor')
        .eq('is_active', true)
        .order('nombres');
      setInstructores(instructoresData || []);

      const { data: ambientesData } = await supabase
        .from('ambientes')
        .select('id, nombre, codigo')
        .eq('is_active', true)
        .order('nombre');
      setAmbientes(ambientesData || []);
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  const loadHorarios = async () => {
    try {
      setLoading(true);
      
      let rpcFunction = '';
      let rpcParams: any = {};

      if (filterMode === 'ficha' && selectedFicha) {
        rpcFunction = 'get_horarios_ficha';
        rpcParams = { p_ficha_id: selectedFicha };
      } else if (filterMode === 'instructor' && selectedInstructor) {
        rpcFunction = 'get_horarios_instructor';
        rpcParams = { p_instructor_id: selectedInstructor };
      } else if (filterMode === 'ambiente' && selectedAmbiente) {
        rpcFunction = 'get_horarios_ambiente';
        rpcParams = { p_ambiente_id: selectedAmbiente };
      } else {
        const { data, error } = await supabase
          .from('horarios_stats')
          .select('*')
          .eq('is_active', true)
          .order('dia_semana')
          .order('hora_inicio');
        
        if (error) throw error;
        setHorarios(data || []);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.rpc(rpcFunction, rpcParams);
      
      if (error) throw error;
      
      const response = typeof data === 'string' ? JSON.parse(data) : data;
      
      if (response.success) {
        if (filterMode === 'instructor') {
          setHorarios(response.data.horarios || []);
        } else {
          setHorarios(response.data || []);
        }
      } else {
        console.error('Error:', response.error);
        setHorarios([]);
      }
    } catch (error) {
      console.error('Error loading horarios:', error);
      setHorarios([]);
    } finally {
      setLoading(false);
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'CLASE': return '#39A900';
      case 'APOYO': return '#00304D';
      case 'RESERVA': return '#71277A';
      default: return '#000000';
    }
  };

  const diasSemana = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
  
  const horariosAgrupados = diasSemana.map(dia => ({
    dia,
    horarios: horarios.filter(h => h.dia_semana === dia)
  }));

  const totalHorasInstructor = filterMode === 'instructor' 
    ? horarios
        .filter(h => h.tipo !== 'RESERVA')
        .reduce((sum, h) => sum + h.horas_semanales, 0)
    : 0;

  const canManageHorarios = currentUser?.role === 'admin' || currentUser?.role === 'coordinador';

  // ⬅️ NUEVO: Abre modal de visualización
  const handleViewHorario = (horario: HorarioData) => {
    setSelectedHorario(horario);
    setViewModalOpen(true);
  };

  const handleEditHorario = (horario: HorarioData) => {
    setSelectedHorario(horario);
    setEditModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#00304D]">Gestión de Horarios</h1>
          <p className="text-gray-600 mt-1">
            Administración de horarios de clases, apoyos y reservas
          </p>
        </div>
        
        <div className="flex gap-2">
          {/* Toggle Vista */}
          <div className="flex border rounded-lg overflow-hidden">
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('calendar')}
              className={viewMode === 'calendar' ? 'bg-[#39A900] hover:bg-[#2d8000]' : ''}
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              Calendario
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-[#39A900] hover:bg-[#2d8000]' : ''}
            >
              <List className="h-4 w-4 mr-2" />
              Lista
            </Button>
          </div>

          <Button 
            variant="outline"
            onClick={() => setExportModalOpen(true)}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          
          {canManageHorarios && (
            <Button 
              className="bg-[#39A900] hover:bg-[#2d8000]"
              onClick={() => setCreateModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Horario
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards (Solo para instructor) */}
      {filterMode === 'instructor' && selectedInstructor && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-[#39A900]">
                {totalHorasInstructor.toFixed(1)}
              </div>
              <p className="text-sm text-gray-600">Horas Semanales</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-[#00304D]">
                {horarios.filter(h => h.tipo === 'CLASE').length}
              </div>
              <p className="text-sm text-gray-600">Clases</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-[#007832]">
                {horarios.filter(h => h.tipo === 'APOYO').length}
              </div>
              <p className="text-sm text-gray-600">Apoyos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-[#71277A]">
                {horarios.filter(h => h.tipo === 'RESERVA').length}
              </div>
              <p className="text-sm text-gray-600">Reservas</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <HorariosFilters
        filterMode={filterMode}
        setFilterMode={setFilterMode}
        selectedFicha={selectedFicha}
        setSelectedFicha={setSelectedFicha}
        selectedInstructor={selectedInstructor}
        setSelectedInstructor={setSelectedInstructor}
        selectedAmbiente={selectedAmbiente}
        setSelectedAmbiente={setSelectedAmbiente}
        fichas={fichas}
        instructores={instructores}
        ambientes={ambientes}
      />

      {/* Contenido según vista */}
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-[#39A900]" />
        </div>
      ) : horarios.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">
              No hay horarios registrados para los filtros seleccionados
            </p>
          </CardContent>
        </Card>
      ) : viewMode === 'calendar' ? (
        <CalendarView 
          horarios={horarios} 
          getTipoColor={getTipoColor}
          onView={handleViewHorario}  // ⬅️ CAMBIADO: ahora abre modal de visualización
        />
      ) : (
        <div className="space-y-6">
          {horariosAgrupados
            .filter(grupo => grupo.horarios.length > 0)
            .map(grupo => (
              <div key={grupo.dia}>
                <h2 className="text-xl font-bold text-[#00304D] mb-3">
                  {grupo.dia}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {grupo.horarios.map(horario => (
                    <HorarioCard
                      key={horario.id}
                      horario={horario}
                      filterMode={filterMode}
                      getTipoColor={getTipoColor}
                      canManage={canManageHorarios}
                      onUpdate={loadHorarios}
                      onView={handleViewHorario}  // ⬅️ NUEVO
                      onEdit={handleEditHorario}
                    />
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Modales */}
      <CreateHorarioModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={loadHorarios}
        fichas={fichas}
        instructores={instructores}
        ambientes={ambientes}
      />

      {/* ⬅️ NUEVO: Modal de visualización */}
      <ViewHorarioModal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        horario={selectedHorario}
        onEdit={handleEditHorario}
        canManage={canManageHorarios}
      />

      <EditHorarioModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSuccess={loadHorarios}
        horario={selectedHorario}
      />

      <ExportModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        filterMode={filterMode}
        selectedId={
          filterMode === 'ficha' ? selectedFicha :
          filterMode === 'instructor' ? selectedInstructor :
          selectedAmbiente
        }
      />
    </div>
  );
}