import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Search, Plus, Target, ChevronDown, ChevronRight } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";

const competenciesData = [
  {
    id: "220501001",
    name: "Desarrollar software aplicando técnicas de programación",
    program: "Análisis y Desarrollo de Software",
    duration: "480 horas",
    learningOutcomes: [
      "Identificar las necesidades del cliente para proponer un sistema de información",
      "Diseñar el sistema de acuerdo con los requisitos del cliente",
      "Desarrollar el sistema que cumpla con los requisitos de la solución informática",
      "Realizar mantenimiento de sistemas de información según necesidades",
      "Implementar la base de datos a partir del diseño elaborado"
    ],
    color: "#39A900"
  },
  {
    id: "220501002",
    name: "Implementar estructuras de datos para la solución de problemas",
    program: "Análisis y Desarrollo de Software",
    duration: "300 horas",
    learningOutcomes: [
      "Identificar estructuras de datos aplicables al problema",
      "Implementar algoritmos usando estructuras de datos",
      "Optimizar el rendimiento usando estructuras apropiadas",
      "Documentar el código implementado"
    ],
    color: "#00304D"
  },
  {
    id: "210101001",
    name: "Diseñar aplicaciones gráficas aplicando principios de diseño",
    program: "Diseño Gráfico Digital",
    duration: "360 horas",
    learningOutcomes: [
      "Aplicar principios de composición visual",
      "Utilizar teoría del color en diseños",
      "Crear elementos gráficos con software especializado",
      "Presentar propuestas de diseño al cliente",
      "Implementar retroalimentación en los diseños"
    ],
    color: "#71277A"
  },
  {
    id: "210401001",
    name: "Administrar recursos de acuerdo con lineamientos organizacionales",
    program: "Gestión Administrativa",
    duration: "420 horas",
    learningOutcomes: [
      "Identificar recursos disponibles en la organización",
      "Planificar la distribución de recursos",
      "Coordinar equipos de trabajo efectivamente",
      "Realizar seguimiento al uso de recursos",
      "Generar informes de gestión"
    ],
    color: "#FDC300"
  },
  {
    id: "220501003",
    name: "Aplicar buenas prácticas de calidad en el proceso de desarrollo",
    program: "Análisis y Desarrollo de Software",
    duration: "240 horas",
    learningOutcomes: [
      "Aplicar estándares de codificación",
      "Realizar pruebas unitarias y de integración",
      "Utilizar herramientas de control de versiones",
      "Documentar el proceso de desarrollo"
    ],
    color: "#007832"
  },
];

export function Competencies() {
  const [searchTerm, setSearchTerm] = useState("");
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setOpenItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const filteredCompetencies = competenciesData.filter(comp =>
    comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comp.id.includes(searchTerm) ||
    comp.program.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#00304D]">Competencias</h1>
          <p className="text-gray-600 mt-1">Gestión de competencias y resultados de aprendizaje</p>
        </div>
        <Button className="bg-[#39A900] hover:bg-[#2d8000]">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Competencia
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-[#39A900]">245</div>
            <p className="text-sm text-gray-600">Total Competencias</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-[#00304D]">1,124</div>
            <p className="text-sm text-gray-600">Resultados de Aprendizaje</p>
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
            <div className="text-2xl font-bold text-[#71277A]">18,420</div>
            <p className="text-sm text-gray-600">Horas Totales</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nombre, código o programa..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Competencies List */}
      <div className="space-y-4">
        {filteredCompetencies.map((competency) => {
          const isOpen = openItems.includes(competency.id);
          
          return (
            <Card key={competency.id} className="border-l-4" style={{ borderLeftColor: competency.color }}>
              <Collapsible open={isOpen} onOpenChange={() => toggleItem(competency.id)}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <Target className="h-6 w-6 mt-1" style={{ color: competency.color }} />
                        <div className="flex-1">
                          <CardTitle className="text-lg text-[#00304D] mb-2">
                            {competency.name}
                          </CardTitle>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline">
                              Código: {competency.id}
                            </Badge>
                            <Badge style={{ backgroundColor: competency.color }}>
                              {competency.duration}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {competency.program}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Badge variant="outline" className="text-xs">
                        {competency.learningOutcomes.length} RAP
                      </Badge>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="icon">
                          {isOpen ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                  </div>
                </CardHeader>
                
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-[#00304D] mb-3">
                        Resultados de Aprendizaje (RAP)
                      </h4>
                      <div className="space-y-2">
                        {competency.learningOutcomes.map((outcome, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white flex-shrink-0"
                              style={{ backgroundColor: competency.color }}
                            >
                              {index + 1}
                            </div>
                            <p className="text-sm text-gray-700 flex-1">{outcome}</p>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex gap-2 mt-4 pt-4 border-t">
                        <Button variant="outline" size="sm">
                          Editar Competencia
                        </Button>
                        <Button variant="outline" size="sm">
                          Agregar RAP
                        </Button>
                        <Button className="bg-[#39A900] hover:bg-[#2d8000]" size="sm">
                          Ver en Programa
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
