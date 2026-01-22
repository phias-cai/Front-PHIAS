// src/components/Instructors.tsx
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Search, Mail, Phone, Calendar, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";

interface InstructorData {
  id: string;
  nombres: string;
  email: string;
  telefono?: string;
  area?: string;
  documento?: string;
  is_active: boolean;
  activeClasses: number;
}

interface InstructorsProps {
  onNavigate?: (view: string, data?: any) => void;
}

export function Instructors({ onNavigate }: InstructorsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [instructors, setInstructors] = useState<InstructorData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInstructors();
  }, []);

  const fetchInstructors = async () => {
    try {
      setLoading(true);

      // Obtener solo usuarios con rol='instructor'
      const { data: instructorsData, error } = await supabase
        .from('profiles')
        .select('id, nombres, email, telefono, area, documento, is_active, created_at')
        .eq('rol', 'instructor')
        .order('nombres', { ascending: true });

      if (error) throw error;

      // TODO: Cuando tengas la tabla 'horarios', descomentar esto para obtener estadísticas:
      // const instructorsWithStats = await Promise.all(
      //   (instructorsData || []).map(async (instructor) => {
      //     const { count } = await supabase
      //       .from('horarios')
      //       .select('id', { count: 'exact', head: true })
      //       .eq('instructor_id', instructor.id);
      //
      //     return { ...instructor, activeClasses: count || 0 };
      //   })
      // );
      // setInstructors(instructorsWithStats);

      // Por ahora, sin estadísticas de horarios (placeholder):
      const instructorsWithStats = (instructorsData || []).map(instructor => ({
        ...instructor,
        activeClasses: 0 // Cuando exista 'horarios', esto se calculará
      }));

      setInstructors(instructorsWithStats);
    } catch (error) {
      console.error('Error fetching instructors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInstructors = instructors.filter(instructor =>
    instructor.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (instructor.area && instructor.area.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  const getRandomColor = (email: string) => {
    const colors = ["#39A900", "#00304D", "#007832", "#71277A", "#FDC300", "#50E5F9"];
    const index = email.length % colors.length;
    return colors[index];
  };

  // EstadÃ­sticas calculadas
  const activeInstructors = instructors.filter(i => i.is_active).length;
  const totalClasses = instructors.reduce((sum, i) => sum + i.activeClasses, 0);
  const uniqueSpecialties = new Set(instructors.map(i => i.area).filter(Boolean)).size;

  return (
    <div className="min-h-screen relative">
      {/* Imagen de fondo MUY sutil */}
      <div
        className="fixed inset-0 bg-cover bg-center pointer-events-none"
        style={{
          backgroundImage: `url('/cai.jpg')`,
          filter: 'brightness(1.2)',
          opacity: '0.1'
        }}
      />

      {/* Contenido */}
      <div className="relative space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#00304D]">Instructores</h1>
            <p className="text-gray-600 mt-1">Gestión de instructores del centro</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-[#39A900]">{instructors.length}</div>
              <p className="text-sm text-gray-600">Total Instructores</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-[#00304D]">{activeInstructors}</div>
              <p className="text-sm text-gray-600">Activos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-[#007832]">{totalClasses}</div>
              <p className="text-sm text-gray-600">Clases Asignadas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-[#71277A]">{uniqueSpecialties}</div>
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
              <Button variant="outline" onClick={fetchInstructors}>
                Actualizar
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-[#39A900]" />
              </div>
            ) : filteredInstructors.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No se encontraron instructores</p>
              </div>
            ) : (
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
                              <AvatarFallback
                                style={{
                                  backgroundColor: getRandomColor(instructor.email) + "30",
                                  color: getRandomColor(instructor.email)
                                }}
                              >
                                {getInitials(instructor.nombres)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-[#00304D]">{instructor.nombres}</p>
                              <p className="text-sm text-gray-500">
                                {instructor.documento || 'Sin documento'}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail className="h-3 w-3" />
                              {instructor.email}
                            </div>
                            {instructor.telefono && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone className="h-3 w-3" />
                                {instructor.telefono}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {instructor.area ? (
                            <Badge
                              variant="outline"
                              style={{
                                borderColor: getRandomColor(instructor.email),
                                color: getRandomColor(instructor.email)
                              }}
                            >
                              {instructor.area}
                            </Badge>
                          ) : (
                            <span className="text-sm text-gray-400">Sin especialidad</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#39A900]/10">
                            <Calendar className="h-3 w-3 text-[#39A900]" />
                            <span className="text-sm font-medium text-[#39A900]">
                              {instructor.activeClasses}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={instructor.is_active ? "bg-[#39A900]" : "bg-gray-500"}>
                            {instructor.is_active ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Ver horarios del instructor"
                            onClick={() => onNavigate?.('horarios', {
                              instructorId: instructor.id,
                              instructorNombre: instructor.nombres
                            })}
                          >
                            <Calendar className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}