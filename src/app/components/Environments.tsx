import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Search, Plus, Building2, Users, Monitor, CheckCircle2, XCircle, Edit, Eye } from "lucide-react";

const environmentsData = [
  {
    id: "AMB-201",
    name: "Ambiente 201",
    type: "Laboratorio de Sistemas",
    capacity: 40,
    floor: 2,
    building: "Bloque A",
    equipment: ["40 Computadores", "Proyector", "Aire Acondicionado", "Red Gigabit"],
    status: "Disponible",
    currentSchedule: null,
    todaySchedules: 5,
    color: "#39A900"
  },
  {
    id: "AMB-305",
    name: "Ambiente 305",
    type: "Laboratorio de Redes",
    capacity: 35,
    floor: 3,
    building: "Bloque A",
    equipment: ["35 Computadores", "Switches", "Routers", "Proyector"],
    status: "Ocupado",
    currentSchedule: "Base de Datos - María González",
    todaySchedules: 6,
    color: "#FDC300"
  },
  {
    id: "AMB-102",
    name: "Ambiente 102",
    type: "Taller de Diseño",
    capacity: 30,
    floor: 1,
    building: "Bloque B",
    equipment: ["30 iMac", "Tabletas Gráficas", "Impresora", "Scanner"],
    status: "Disponible",
    currentSchedule: null,
    todaySchedules: 4,
    color: "#39A900"
  },
  {
    id: "AMB-405",
    name: "Ambiente 405",
    type: "Aula de Clase",
    capacity: 45,
    floor: 4,
    building: "Bloque A",
    equipment: ["Proyector", "Tablero Digital", "Sistema de Audio"],
    status: "Disponible",
    currentSchedule: null,
    todaySchedules: 3,
    color: "#39A900"
  },
  {
    id: "AMB-301",
    name: "Ambiente 301",
    type: "Laboratorio de Idiomas",
    capacity: 35,
    floor: 3,
    building: "Bloque B",
    equipment: ["35 Computadores", "Software de Idiomas", "Audífonos"],
    status: "Mantenimiento",
    currentSchedule: null,
    todaySchedules: 0,
    color: "#d4183d"
  },
  {
    id: "AMB-501",
    name: "Ambiente 501",
    type: "Laboratorio de Automatización",
    capacity: 25,
    floor: 5,
    building: "Bloque A",
    equipment: ["PLCs", "HMI", "Sensores", "Actuadores", "Robots"],
    status: "Disponible",
    currentSchedule: null,
    todaySchedules: 4,
    color: "#39A900"
  },
];

interface EnvironmentsProps {
  onOpenModal?: (modalType: string, data?: any) => void;
}

export function Environments({ onOpenModal }: EnvironmentsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Todos");

  const filteredEnvironments = environmentsData.filter(env => {
    const matchesSearch = env.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      env.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      env.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "Todos" || env.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Disponible":
        return <Badge className="bg-[#39A900]">{status}</Badge>;
      case "Ocupado":
        return <Badge className="bg-[#FDC300] text-[#00304D]">{status}</Badge>;
      case "Mantenimiento":
        return <Badge className="bg-red-600">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const totalEnvironments = environmentsData.length;
  const availableEnvironments = environmentsData.filter(e => e.status === "Disponible").length;
  const occupiedEnvironments = environmentsData.filter(e => e.status === "Ocupado").length;
  const totalCapacity = environmentsData.reduce((sum, e) => sum + e.capacity, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#00304D]">Ambientes</h1>
          <p className="text-gray-600 mt-1">Gestión de ambientes de formación</p>
        </div>
        <Button 
          className="bg-[#39A900] hover:bg-[#2d8000]"
          onClick={() => onOpenModal?.('createEnvironment')}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Ambiente
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-[#39A900]">{totalEnvironments}</div>
                <p className="text-sm text-gray-600">Total Ambientes</p>
              </div>
              <Building2 className="h-8 w-8 text-[#39A900]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-[#39A900]">{availableEnvironments}</div>
                <p className="text-sm text-gray-600">Disponibles</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-[#39A900]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-[#FDC300]">{occupiedEnvironments}</div>
                <p className="text-sm text-gray-600">Ocupados</p>
              </div>
              <XCircle className="h-8 w-8 text-[#FDC300]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-[#00304D]">{totalCapacity}</div>
                <p className="text-sm text-gray-600">Capacidad Total</p>
              </div>
              <Users className="h-8 w-8 text-[#00304D]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, código o tipo..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              {["Todos", "Disponible", "Ocupado", "Mantenimiento"].map((status) => (
                <Button
                  key={status}
                  variant={filterStatus === status ? "default" : "outline"}
                  onClick={() => setFilterStatus(status)}
                  className={filterStatus === status ? "bg-[#39A900] hover:bg-[#2d8000]" : ""}
                  size="sm"
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Environments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEnvironments.map((env) => (
          <Card key={env.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="h-5 w-5 text-[#39A900]" />
                    <CardTitle className="text-lg text-[#00304D]">{env.name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {env.id}
                    </Badge>
                    {getStatusBadge(env.status)}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">{env.type}</p>
                <p className="text-xs text-gray-500">{env.building} - Piso {env.floor}</p>
              </div>

              <div className="flex items-center justify-between py-2 border-t border-b">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#39A900]" />
                  <span className="text-sm font-medium">Capacidad</span>
                </div>
                <span className="text-sm font-bold text-[#00304D]">{env.capacity} personas</span>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-700 mb-2">Equipamiento:</p>
                <div className="flex flex-wrap gap-1">
                  {env.equipment.slice(0, 2).map((item, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {item}
                    </Badge>
                  ))}
                  {env.equipment.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{env.equipment.length - 2} más
                    </Badge>
                  )}
                </div>
              </div>

              {env.currentSchedule && (
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="text-xs font-medium text-[#00304D]">Clase actual:</p>
                  <p className="text-xs text-gray-600">{env.currentSchedule}</p>
                </div>
              )}

              <div className="text-xs text-gray-500">
                {env.todaySchedules} clases programadas hoy
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => onOpenModal?.('viewEnvironment', env)}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Ver
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => onOpenModal?.('editEnvironment', env)}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Editar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
