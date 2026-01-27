// src/app/components/Horarios.tsx
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Loader2, Plus, Download, Calendar as CalendarIcon, List, Upload, Eye } from "lucide-react"; // ← Eye agregado
import { useAuth } from "../contexts/AuthContext";
import { HorariosFilters } from "./horarios/HorariosFilters";
import { CreateHorarioModal } from "./horarios/CreateHorarioModal";
import { ViewHorarioModal } from "./horarios/ViewHorarioModal";
import { EditHorarioModal } from "./horarios/EditHorarioModal";
import { HorarioCard } from "./horarios/HorarioCard";
import { CalendarView } from "./horarios/CalendarView";
import { ExportModal } from "./horarios/ExportModal";
import { UploadMassiveModal } from "./horarios/UploadMassiveModal";
import { UploadMassiveInstructorModal } from './horarios/Uploadmassiveinstructormodal';
import { MonthSelector } from "./horarios/MonthSelector";

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
  apoyo?: string;
  
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

interface HorariosProps {
  navigationData?: {
    fichaId?: string;
    fichaNumero?: string;
    instructorId?: string;
    instructorNombre?: string;
  } | null;
}

export function Horarios({ navigationData }: HorariosProps = {}) {
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [horarios, setHorarios] = useState<HorarioData[]>([]);
  const [uploadMassiveInstructorModalOpen, setUploadMassiveInstructorModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  
  // Vista
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [showInactive, setShowInactive] = useState(false); // ← NUEVO: Estado para toggle
  
  // Filtros
  const [filterMode, setFilterMode] = useState<FilterMode>('ficha');
  const [selectedFicha, setSelectedFicha] = useState<string>('');
  const [selectedInstructor, setSelectedInstructor] = useState<string>('');
  const [selectedAmbiente, setSelectedAmbiente] = useState<string>('');
  
  // Modales
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [uploadMassiveModalOpen, setUploadMassiveModalOpen] = useState(false);
  const [selectedHorario, setSelectedHorario] = useState<HorarioData | null>(null);
  
  // Opciones para filtros
  const [fichas, setFichas] = useState<any[]>([]);
  const [instructores, setInstructores] = useState<any[]>([]);
  const [ambientes, setAmbientes] = useState<any[]>([]);
  const [programaNombre, setProgramaNombre] = useState<string>('');

  const canManageHorarios = currentUser?.role === 'admin' || currentUser?.role === 'coordinador';

  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    loadHorarios();
  }, [filterMode, selectedFicha, selectedInstructor, selectedAmbiente]);

  // Detectar navegación desde Fichas o Instructors
  useEffect(() => {
    if (navigationData?.fichaId) {
      setFilterMode("ficha");
      setSelectedFicha(navigationData.fichaId);
    } else if (navigationData?.instructorId) {
      setFilterMode("instructor");
      setSelectedInstructor(navigationData.instructorId);
    }
  }, [navigationData]);

  // ✅ AUTO-SELECCIÓN: Si es instructor, seleccionarlo automáticamente en modo instructor
  useEffect(() => {
    if (currentUser?.role === 'instructor' && filterMode === 'instructor' && !selectedInstructor) {
      setSelectedInstructor(currentUser.id);
    }
  }, [currentUser, filterMode, selectedInstructor]);

  // ⬅️ NUEVO: Cargar nombre del programa cuando se selecciona ficha
  useEffect(() => {
    if (selectedFicha) {
      const loadProgramaNombre = async () => {
        try {
          const { data: fichaData } = await supabase
            .from('fichas')
            .select('programa_id')
            .eq('id', selectedFicha)
            .single();

          if (fichaData?.programa_id) {
            const { data: programaData } = await supabase
              .from('programas')
              .select('nombre')
              .eq('id', fichaData.programa_id)
              .single();

            setProgramaNombre(programaData?.nombre || '');
          }
        } catch (error) {
          console.error('Error loading programa nombre:', error);
        }
      };

      loadProgramaNombre();
    } else {
      setProgramaNombre('');
    }
  }, [selectedFicha]);

  const loadFilterOptions = async () => {
    try {
      const { data: fichasData } = await supabase
        .from('fichas')
        .select('id, numero, programa_id')
        .eq('is_active', true)
        .order('numero');
      setFichas(fichasData || []);

      // ✅ PERMISOS: Si es instructor, solo mostrar su propio perfil
      let instructoresData;
      if (currentUser?.role === 'instructor') {
        // Instructor solo ve su propio perfil
        instructoresData = [{
          id: currentUser.id,
          nombres: currentUser.name
        }];
      } else {
        // Admin/Coordinador ven todos los instructores
        const { data } = await supabase
          .from('profiles')
          .select('id, nombres')
          .eq('rol', 'instructor')
          .eq('is_active', true)
          .order('nombres');
        instructoresData = data || [];
      }
      setInstructores(instructoresData);

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
    if (!selectedFicha && !selectedInstructor && !selectedAmbiente) {
      setHorarios([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
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
        setHorarios([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.rpc(rpcFunction, rpcParams);

      if (error) {
        console.error('Error en RPC:', error);
        throw error;
      }

      const response = typeof data === 'string' ? JSON.parse(data) : data;

      if (response.success) {
        let horariosData = [];
        
        if (filterMode === 'instructor') {
          horariosData = response.data.horarios || [];
        } else {
          horariosData = response.data || [];
        }

        setHorarios(horariosData);
      } else {
        console.error('Error en respuesta:', response.error);
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
  
  // ✅ MODIFICADO: Filtrar por is_active según el toggle
  const horariosAgrupados = diasSemana.map(dia => ({
    dia,
    horarios: horarios
      .filter(h => h.dia_semana === dia)
      .filter(h => showInactive || h.is_active) // ← NUEVO: Filtro de activos
  }));

  const totalHorasInstructor = filterMode === 'instructor' 
    ? horarios
        .filter(h => h.tipo !== 'RESERVA')
        .filter(h => showInactive || h.is_active) // ← NUEVO: También filtrar en totales
        .reduce((sum, h) => sum + h.horas_semanales, 0)
    : 0;

  const handleViewHorario = (horario: HorarioData) => {
    setSelectedHorario(horario);
    setViewModalOpen(true);
  };

  const handleEditHorario = (horario: HorarioData) => {
    setSelectedHorario(horario);
    setEditModalOpen(true);
  };

  // ✅ NUEVO: Contador de inactivos
  const inactivosCount = horarios.filter(h => !h.is_active).length;

  return (
    <div className="min-h-screen relative">
      {/* Imagen de fondo MUY sutil */}
      <div 
        className="fixed inset-0 bg-cover bg-center pointer-events-none"
        style={{
          backgroundImage: `url('/cai.jpg')`,
          filter: 'brightness(0.8)',
          opacity: '0.2'
        }}
      />
      
      {/* Contenido */}
      <div className="relative space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <img 
                src="/phias.png" 
                alt="PHIAS Logo" 
                className="h-12 w-auto relative z-10"
              />
              <h1 className="text-3xl font-bold text-[#00304D]">
                Gestión de Horarios
              </h1>
            </div>

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
                className="rounded-none"
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                Calendario
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-none"
              >
                <List className="h-4 w-4 mr-2" />
                Lista
              </Button>
            </div>

            {/* ✅ NUEVO: Toggle Mostrar Inactivos */}
            {canManageHorarios && (
              <Button
                variant={showInactive ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowInactive(!showInactive)}
                className={showInactive ? 'bg-gray-600 hover:bg-gray-700' : ''}
              >
                <Eye className="h-4 w-4 mr-2" />
                {showInactive 
                  ? 'Ocultar Inactivos' 
                  : `Mostrar Inactivos${inactivosCount > 0 ? ` (${inactivosCount})` : ''}`
                }
              </Button>
            )}

            {/* Botón Exportar (Admin/Coordinador y con filtro seleccionado) */}
            {canManageHorarios && (selectedFicha || selectedInstructor || selectedAmbiente) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setExportModalOpen(true)}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            )}

            {/* Botón Carga Masiva por Ficha */}
            {canManageHorarios && filterMode === 'ficha' && selectedFicha && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUploadMassiveModalOpen(true)}
              >
                <Upload className="h-4 w-4 mr-2" />
                Carga Masiva
              </Button>
            )}

            {/* Botón Carga Masiva por Instructor */}
            {canManageHorarios && filterMode === 'instructor' && selectedInstructor && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUploadMassiveInstructorModalOpen(true)}
              >
                <Upload className="h-4 w-4 mr-2" />
                Carga Masiva
              </Button>
            )}

            {/* Botón Nuevo Horario */}
            {canManageHorarios && (
              <Button
                onClick={() => setCreateModalOpen(true)}
                size="sm"
                className="bg-[#39A900] hover:bg-[#2d8000] text-white"
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
                  {horarios.filter(h => h.tipo === 'CLASE' && (showInactive || h.is_active)).length}
                </div>
                <p className="text-sm text-gray-600">Clases</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-[#007832]">
                  {horarios.filter(h => h.tipo === 'APOYO' && (showInactive || h.is_active)).length}
                </div>
                <p className="text-sm text-gray-600">Apoyos</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-[#71277A]">
                  {horarios.filter(h => h.tipo === 'RESERVA' && (showInactive || h.is_active)).length}
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
          userRole={currentUser?.role}
        />

        {/* Selector de Mes (Solo para instructor en vista lista) */}
        {filterMode === 'instructor' && selectedInstructor && viewMode === 'list' && (
          <MonthSelector
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
            horarios={horarios.filter(h => showInactive || h.is_active)}
            instructorNombre={instructores.find(i => i.id === selectedInstructor)?.nombres || ''}
          />
        )}

        {/* Contenido según vista */}
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-[#39A900]" />
          </div>
        ) : horarios.filter(h => showInactive || h.is_active).length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-gray-500">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay horarios {showInactive ? '' : 'activos'} registrados</p>
                <p className="text-sm mt-2">
                  {filterMode === 'instructor' && 'Selecciona un instructor para ver sus horarios'}
                  {filterMode === 'ficha' && 'Selecciona una ficha para ver sus horarios'}
                  {filterMode === 'ambiente' && 'Selecciona un ambiente para ver sus horarios'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {viewMode === 'calendar' ? (
              <CalendarView
                horarios={showInactive ? horarios : horarios.filter(h => h.is_active)} // ← MODIFICADO
                getTipoColor={getTipoColor}
                onView={handleViewHorario}
                filterMode={filterMode}
              />
            ) : (
              <div className="space-y-4">
                {horariosAgrupados.map(({ dia, horarios: horariosDelDia }) => (
                  horariosDelDia.length > 0 && (
                    <div key={dia}>
                      <h3 className="text-lg font-semibold text-[#00304D] mb-3">
                        {dia}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {horariosDelDia.map((horario) => (
                          <HorarioCard
                            key={horario.id}
                            horario={horario}
                            filterMode={filterMode}
                            getTipoColor={getTipoColor}
                            canManage={canManageHorarios}
                            onUpdate={loadHorarios}
                            onView={handleViewHorario}
                            onEdit={handleEditHorario}
                          />
                        ))}
                      </div>
                    </div>
                  )
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modales */}
      <CreateHorarioModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => {
          setCreateModalOpen(false);
          loadHorarios();
        }}
        fichas={fichas}
        instructores={instructores}
        ambientes={ambientes}
      />

      <ViewHorarioModal
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedHorario(null);
        }}
        horario={selectedHorario}
        getTipoColor={getTipoColor}
        onEdit={handleEditHorario}
        canManage={canManageHorarios}
      />

      <EditHorarioModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedHorario(null);
        }}
        onSuccess={() => {
          setEditModalOpen(false);
          setSelectedHorario(null);
          loadHorarios();
        }}
        horario={selectedHorario}
      />

      <ExportModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        filterMode={filterMode}
        selectedId={selectedFicha || selectedInstructor || selectedAmbiente || ''}
        selectedName={
          filterMode === 'ficha'
            ? fichas.find(f => f.id === selectedFicha)?.numero
            : filterMode === 'instructor'
            ? instructores.find(i => i.id === selectedInstructor)?.nombres
            : ambientes.find(a => a.id === selectedAmbiente)?.nombre
        }
      />

      {/* Modal Carga Masiva por Ficha */}
      {filterMode === 'ficha' && selectedFicha && (
        <UploadMassiveModal
          open={uploadMassiveModalOpen}
          onClose={() => setUploadMassiveModalOpen(false)}
          onSuccess={() => {
            setUploadMassiveModalOpen(false);
            loadHorarios();
          }}
          selectedFicha={selectedFicha}
          fichaNumero={fichas.find(f => f.id === selectedFicha)?.numero || ''}
          programaNombre={programaNombre}
        />
      )}

      {/* Modal Carga Masiva por Instructor */}
      {filterMode === 'instructor' && selectedInstructor && (
        <UploadMassiveInstructorModal
          open={uploadMassiveInstructorModalOpen}
          onClose={() => setUploadMassiveInstructorModalOpen(false)}
          onSuccess={() => {
            setUploadMassiveInstructorModalOpen(false);
            loadHorarios();
          }}
          selectedInstructor={selectedInstructor}
          instructorNombre={instructores.find(i => i.id === selectedInstructor)?.nombres || ''}
        />
      )}
    </div>
  );
}