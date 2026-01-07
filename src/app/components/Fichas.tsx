import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Search, Plus, Users, Calendar, BookOpen, Edit, Eye } from "lucide-react";
import { Progress } from "./ui/progress";

const fichasData = [
  {
    id: "2559874",
    name: "Análisis y Desarrollo de Software",
    program: "Tecnología",
    students: 35,
    maxStudents: 40,
    startDate: "2024-01-15",
    endDate: "2025-12-20",
    instructor: "Carlos Ramírez",
    progress: 65,
    status: "En formación",
    color: "#39A900"
  },
  {
    id: "2445621",
    name: "Gestión de Bases de Datos",
    program: "Tecnología",
    students: 28,
    maxStudents: 35,
    startDate: "2024-02-01",
    endDate: "2025-10-15",
    instructor: "María González",
    progress: 58,
    status: "En formación",
    color: "#00304D"
  },
  {
    id: "2334455",
    name: "Diseño Gráfico Digital",
    program: "Diseño",
    students: 30,
    maxStudents: 35,
    startDate: "2024-01-20",
    endDate: "2025-11-30",
    instructor: "Ana Martínez",
    progress: 62,
    status: "En formación",
    color: "#71277A"
  },
  {
    id: "2223344",
    name: "Administración de Empresas",
    program: "Administración",
    students: 32,
    maxStudents: 40,
    startDate: "2024-03-01",
    endDate: "2026-01-15",
    instructor: "Pedro López",
    progress: 45,
    status: "En formación",
    color: "#FDC300"
  },
  {
    id: "2112233",
    name: "Marketing Digital",
    program: "Administración",
    students: 25,
    maxStudents: 30,
    startDate: "2024-02-15",
    endDate: "2025-09-20",
    instructor: "Laura Sánchez",
    progress: 70,
    status: "En formación",
    color: "#007832"
  },
];

export function Fichas() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFichas = fichasData.filter(ficha =>
    ficha.id.includes(searchTerm) ||
    ficha.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ficha.program.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    if (status === "En formación") return "bg-[#39A900]";
    if (status === "Finalizado") return "bg-gray-500";
    return "bg-blue-500";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#00304D]">Fichas</h1>
          <p className="text-gray-600 mt-1">Gestión de fichas de formación</p>
        </div>
        <Button className="bg-[#39A900] hover:bg-[#2d8000]">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Ficha
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-[#39A900]">24</div>
            <p className="text-sm text-gray-600">Fichas Activas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-[#00304D]">845</div>
            <p className="text-sm text-gray-600">Total Aprendices</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-[#007832]">16</div>
            <p className="text-sm text-gray-600">Programas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-[#71277A]">92%</div>
            <p className="text-sm text-gray-600">Tasa de Asistencia</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Fichas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por número de ficha, nombre o programa..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline">Filtros</Button>
          </div>

          <div className="space-y-4">
            {filteredFichas.map((ficha) => (
              <Card key={ficha.id} className="border-l-4" style={{ borderLeftColor: ficha.color }}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg text-[#00304D]">{ficha.name}</h3>
                        <Badge className={getStatusColor(ficha.status)}>{ficha.status}</Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <BookOpen className="h-4 w-4 text-[#39A900]" />
                          <span className="font-medium">Ficha:</span> {ficha.id}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="h-4 w-4 text-[#39A900]" />
                          <span className="font-medium">Aprendices:</span> {ficha.students}/{ficha.maxStudents}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4 text-[#39A900]" />
                          <span className="font-medium">Inicio:</span> {new Date(ficha.startDate).toLocaleDateString('es-CO')}
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Progreso del programa</span>
                          <span className="text-sm font-medium text-[#39A900]">{ficha.progress}%</span>
                        </div>
                        <Progress value={ficha.progress} className="h-2" />
                      </div>

                      <div className="flex items-center gap-4 mt-4">
                        <Badge variant="outline" style={{ borderColor: ficha.color, color: ficha.color }}>
                          {ficha.program}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          Instructor: {ficha.instructor}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button variant="outline" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button className="bg-[#39A900] hover:bg-[#2d8000]">
                        Ver Horarios
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
