import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Search, Plus, Award, Clock, Target, BookOpen } from "lucide-react";

const programsData = [
  {
    id: 1,
    code: "228106",
    name: "Análisis y Desarrollo de Software",
    type: "Tecnólogo",
    duration: "24 meses",
    competencies: 18,
    learningOutcomes: 84,
    activeGroups: 3,
    category: "Tecnología",
    color: "#39A900"
  },
  {
    id: 2,
    code: "228120",
    name: "Gestión de Bases de Datos",
    type: "Tecnólogo",
    duration: "18 meses",
    competencies: 14,
    learningOutcomes: 62,
    activeGroups: 2,
    category: "Tecnología",
    color: "#00304D"
  },
  {
    id: 3,
    code: "224201",
    name: "Diseño Gráfico Digital",
    type: "Tecnólogo",
    duration: "24 meses",
    competencies: 16,
    learningOutcomes: 72,
    activeGroups: 2,
    category: "Diseño",
    color: "#71277A"
  },
  {
    id: 4,
    code: "122116",
    name: "Gestión Administrativa",
    type: "Tecnólogo",
    duration: "24 meses",
    competencies: 15,
    learningOutcomes: 68,
    activeGroups: 4,
    category: "Administración",
    color: "#FDC300"
  },
  {
    id: 5,
    code: "623102",
    name: "Marketing Digital",
    type: "Técnico",
    duration: "12 meses",
    competencies: 10,
    learningOutcomes: 45,
    activeGroups: 2,
    category: "Administración",
    color: "#007832"
  },
  {
    id: 6,
    code: "228103",
    name: "Programación de Software",
    type: "Técnico",
    duration: "18 meses",
    competencies: 12,
    learningOutcomes: 54,
    activeGroups: 3,
    category: "Tecnología",
    color: "#50E5F9"
  },
];

export function Programs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  const categories = ["Todos", "Tecnología", "Diseño", "Administración"];

  const filteredPrograms = programsData.filter(program => {
    const matchesSearch = program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.code.includes(searchTerm);
    const matchesCategory = selectedCategory === "Todos" || program.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#00304D]">Programas de Formación</h1>
          <p className="text-gray-600 mt-1">Gestión de programas y competencias</p>
        </div>
        <Button className="bg-[#39A900] hover:bg-[#2d8000]">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Programa
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-[#39A900]">16</div>
            <p className="text-sm text-gray-600">Programas Activos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-[#00304D]">245</div>
            <p className="text-sm text-gray-600">Total Competencias</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-[#007832]">1,124</div>
            <p className="text-sm text-gray-600">Resultados de Aprendizaje</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-[#71277A]">24</div>
            <p className="text-sm text-gray-600">Fichas Activas</p>
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
                placeholder="Buscar por nombre o código de programa..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category ? "bg-[#39A900] hover:bg-[#2d8000]" : ""}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Programs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPrograms.map((program) => (
          <Card key={program.id} className="hover:shadow-lg transition-shadow border-t-4" style={{ borderTopColor: program.color }}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg text-[#00304D] mb-2">{program.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      Código: {program.code}
                    </Badge>
                    <Badge className="text-xs" style={{ backgroundColor: program.color }}>
                      {program.type}
                    </Badge>
                  </div>
                </div>
                <Award className="h-8 w-8" style={{ color: program.color }} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#39A900]" />
                  <div>
                    <p className="text-xs text-gray-500">Duración</p>
                    <p className="text-sm font-medium text-[#00304D]">{program.duration}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-[#39A900]" />
                  <div>
                    <p className="text-xs text-gray-500">Fichas</p>
                    <p className="text-sm font-medium text-[#00304D]">{program.activeGroups}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Competencias</span>
                  <span className="text-sm font-medium text-[#39A900]">{program.competencies}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Resultados de Aprendizaje</span>
                  <span className="text-sm font-medium text-[#00304D]">{program.learningOutcomes}</span>
                </div>
              </div>

              <div className="pt-4 border-t flex gap-2">
                <Button variant="outline" className="flex-1" size="sm">
                  Ver Detalles
                </Button>
                <Button className="flex-1 bg-[#39A900] hover:bg-[#2d8000]" size="sm">
                  <Target className="h-3 w-3 mr-1" />
                  Competencias
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
