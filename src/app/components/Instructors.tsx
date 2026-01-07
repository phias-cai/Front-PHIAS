import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Search, Plus, Mail, Phone, Calendar, Edit, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";

const instructorsData = [
  {
    id: 1,
    name: "Carlos Ramírez",
    email: "cramirez@sena.edu.co",
    phone: "301 234 5678",
    specialty: "Desarrollo de Software",
    activeClasses: 12,
    status: "Activo",
    color: "#39A900"
  },
  {
    id: 2,
    name: "María González",
    email: "mgonzalez@sena.edu.co",
    phone: "302 345 6789",
    specialty: "Base de Datos",
    activeClasses: 8,
    status: "Activo",
    color: "#00304D"
  },
  {
    id: 3,
    name: "Juan Pérez",
    email: "jperez@sena.edu.co",
    phone: "303 456 7890",
    specialty: "Programación",
    activeClasses: 10,
    status: "Activo",
    color: "#007832"
  },
  {
    id: 4,
    name: "Ana Martínez",
    email: "amartinez@sena.edu.co",
    phone: "304 567 8901",
    specialty: "Diseño Gráfico",
    activeClasses: 6,
    status: "Activo",
    color: "#71277A"
  },
  {
    id: 5,
    name: "Pedro López",
    email: "plopez@sena.edu.co",
    phone: "305 678 9012",
    specialty: "Gestión de Proyectos",
    activeClasses: 5,
    status: "Activo",
    color: "#FDC300"
  },
  {
    id: 6,
    name: "Laura Sánchez",
    email: "lsanchez@sena.edu.co",
    phone: "306 789 0123",
    specialty: "Inglés",
    activeClasses: 15,
    status: "Activo",
    color: "#50E5F9"
  },
];

export function Instructors() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredInstructors = instructorsData.filter(instructor =>
    instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    instructor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#00304D]">Instructores</h1>
          <p className="text-gray-600 mt-1">Gestión de instructores del centro</p>
        </div>
        <Button className="bg-[#39A900] hover:bg-[#2d8000]">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Instructor
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-[#39A900]">48</div>
            <p className="text-sm text-gray-600">Total Instructores</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-[#00304D]">45</div>
            <p className="text-sm text-gray-600">Activos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-[#007832]">156</div>
            <p className="text-sm text-gray-600">Clases Asignadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-[#71277A]">12</div>
            <p className="text-sm text-gray-600">Especialidades</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Instructores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre o especialidad..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline">Filtros</Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Especialidad</TableHead>
                  <TableHead className="text-center">Clases Activas</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInstructors.map((instructor) => (
                  <TableRow key={instructor.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback style={{ backgroundColor: instructor.color + "30", color: instructor.color }}>
                            {getInitials(instructor.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-[#00304D]">{instructor.name}</p>
                          <p className="text-sm text-gray-500">ID: {instructor.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-3 w-3" />
                          {instructor.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="h-3 w-3" />
                          {instructor.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" style={{ borderColor: instructor.color, color: instructor.color }}>
                        {instructor.specialty}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#39A900]/10">
                        <Calendar className="h-3 w-3 text-[#39A900]" />
                        <span className="text-sm font-medium text-[#39A900]">{instructor.activeClasses}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-[#39A900]">{instructor.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
