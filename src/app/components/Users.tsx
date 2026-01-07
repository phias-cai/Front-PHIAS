import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Search, Plus, Shield, Mail, Calendar, Edit, Trash2, UserCheck } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";

const usersData = [
  {
    id: 1,
    name: "Carlos Ramírez",
    email: "cramirez@sena.edu.co",
    role: "Instructor",
    permissions: ["Ver Horarios", "Editar Horarios", "Ver Fichas"],
    status: "Activo",
    lastLogin: "2026-01-07",
    color: "#39A900"
  },
  {
    id: 2,
    name: "Ana García",
    email: "agarcia@sena.edu.co",
    role: "Coordinador",
    permissions: ["Administrador", "Todos los permisos"],
    status: "Activo",
    lastLogin: "2026-01-07",
    color: "#00304D"
  },
  {
    id: 3,
    name: "Juan Pérez",
    email: "jperez@sena.edu.co",
    role: "Instructor",
    permissions: ["Ver Horarios", "Editar Horarios"],
    status: "Activo",
    lastLogin: "2026-01-06",
    color: "#007832"
  },
  {
    id: 4,
    name: "María González",
    email: "mgonzalez@sena.edu.co",
    role: "Instructor",
    permissions: ["Ver Horarios", "Editar Horarios", "Ver Fichas"],
    status: "Activo",
    lastLogin: "2026-01-07",
    color: "#71277A"
  },
  {
    id: 5,
    name: "Pedro López",
    email: "plopez@sena.edu.co",
    role: "Asistente",
    permissions: ["Ver Horarios", "Ver Fichas"],
    status: "Activo",
    lastLogin: "2026-01-05",
    color: "#FDC300"
  },
  {
    id: 6,
    name: "Laura Sánchez",
    email: "lsanchez@sena.edu.co",
    role: "Instructor",
    permissions: ["Ver Horarios", "Editar Horarios"],
    status: "Inactivo",
    lastLogin: "2025-12-20",
    color: "#50E5F9"
  },
];

const roles = [
  { name: "Coordinador", color: "#00304D", level: "Alto" },
  { name: "Instructor", color: "#39A900", level: "Medio" },
  { name: "Asistente", color: "#FDC300", level: "Básico" },
];

export function Users() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = usersData.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  const getRoleBadgeColor = (role: string) => {
    const roleData = roles.find(r => r.name === role);
    return roleData?.color || "#000000";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#00304D]">Usuarios</h1>
          <p className="text-gray-600 mt-1">Gestión de usuarios y permisos del sistema</p>
        </div>
        <Button className="bg-[#39A900] hover:bg-[#2d8000]">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Usuario
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-[#39A900]">52</div>
            <p className="text-sm text-gray-600">Total Usuarios</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-[#00304D]">48</div>
            <p className="text-sm text-gray-600">Activos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-[#007832]">42</div>
            <p className="text-sm text-gray-600">Instructores</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-[#71277A]">6</div>
            <p className="text-sm text-gray-600">Coordinadores</p>
          </CardContent>
        </Card>
      </div>

      {/* Roles Info */}
      <Card>
        <CardHeader>
          <CardTitle>Roles y Permisos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {roles.map((role, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="h-5 w-5" style={{ color: role.color }} />
                  <div>
                    <h4 className="font-medium text-[#00304D]">{role.name}</h4>
                    <p className="text-xs text-gray-500">Nivel: {role.level}</p>
                  </div>
                </div>
                <Badge style={{ backgroundColor: role.color }}>
                  {usersData.filter(u => u.role === role.name).length} usuarios
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, email o rol..."
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
                  <TableHead>Usuario</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Permisos</TableHead>
                  <TableHead>Último Acceso</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback style={{ backgroundColor: user.color + "30", color: user.color }}>
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-[#00304D]">{user.name}</p>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge style={{ backgroundColor: getRoleBadgeColor(user.role) }}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.permissions.slice(0, 2).map((permission, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                        {user.permissions.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{user.permissions.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-3 w-3" />
                        {new Date(user.lastLogin).toLocaleDateString('es-CO')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={user.status === "Activo" ? "bg-[#39A900]" : "bg-gray-500"}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" title="Editar usuario">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Gestionar permisos">
                          <Shield className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700" title="Eliminar">
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
