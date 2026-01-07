import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Search, Upload, FileText, CheckCircle2, Clock, Download, Eye } from "lucide-react";
import { Progress } from "./ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

const resultsData = [
  {
    id: 1,
    ficha: "2559874",
    fichaName: "Análisis y Desarrollo de Software",
    competency: "220501001 - Desarrollar software aplicando técnicas de programación",
    totalStudents: 35,
    uploadedFiles: 3,
    pendingFiles: 2,
    lastUpdate: "2026-01-05",
    status: "Incompleto",
    progress: 60,
    color: "#FDC300",
    files: [
      { name: "RAP1_evidencias.pdf", date: "2026-01-05", status: "Aprobado" },
      { name: "RAP2_evidencias.pdf", date: "2026-01-04", status: "Aprobado" },
      { name: "RAP3_evidencias.pdf", date: "2026-01-03", status: "Pendiente" },
    ]
  },
  {
    id: 2,
    ficha: "2445621",
    fichaName: "Gestión de Bases de Datos",
    competency: "220501002 - Administrar bases de datos según requerimientos",
    totalStudents: 28,
    uploadedFiles: 5,
    pendingFiles: 0,
    lastUpdate: "2026-01-06",
    status: "Completo",
    progress: 100,
    color: "#39A900",
    files: [
      { name: "RAP1_evidencias.pdf", date: "2026-01-06", status: "Aprobado" },
      { name: "RAP2_evidencias.pdf", date: "2026-01-05", status: "Aprobado" },
      { name: "RAP3_evidencias.pdf", date: "2026-01-04", status: "Aprobado" },
      { name: "RAP4_evidencias.pdf", date: "2026-01-03", status: "Aprobado" },
      { name: "RAP5_evidencias.pdf", date: "2026-01-02", status: "Aprobado" },
    ]
  },
  {
    id: 3,
    ficha: "2334455",
    fichaName: "Diseño Gráfico Digital",
    competency: "210101001 - Diseñar aplicaciones gráficas aplicando principios",
    totalStudents: 30,
    uploadedFiles: 2,
    pendingFiles: 3,
    lastUpdate: "2026-01-04",
    status: "Incompleto",
    progress: 40,
    color: "#71277A",
    files: [
      { name: "RAP1_evidencias.pdf", date: "2026-01-04", status: "Aprobado" },
      { name: "RAP2_evidencias.pdf", date: "2026-01-03", status: "Pendiente" },
    ]
  },
];

interface ResultsProps {
  onOpenModal?: (modalType: string, data?: any) => void;
}

export function Results({ onOpenModal }: ResultsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [selectedResult, setSelectedResult] = useState<typeof resultsData[0] | null>(null);

  const filteredResults = resultsData.filter(result => {
    const matchesSearch = result.ficha.includes(searchTerm) ||
      result.fichaName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.competency.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "Todos" || result.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    if (status === "Completo") {
      return <Badge className="bg-[#39A900]">{status}</Badge>;
    }
    if (status === "Incompleto") {
      return <Badge className="bg-[#FDC300] text-[#00304D]">{status}</Badge>;
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  const totalUploaded = resultsData.reduce((sum, r) => sum + r.uploadedFiles, 0);
  const totalPending = resultsData.reduce((sum, r) => sum + r.pendingFiles, 0);
  const completedCompetencies = resultsData.filter(r => r.status === "Completo").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#00304D]">Resultados de Aprendizaje</h1>
          <p className="text-gray-600 mt-1">Gestión de evidencias y resultados por competencia</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-[#39A900]">{completedCompetencies}</div>
                <p className="text-sm text-gray-600">Completadas</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-[#39A900]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-[#00304D]">{totalUploaded}</div>
                <p className="text-sm text-gray-600">Archivos Subidos</p>
              </div>
              <FileText className="h-8 w-8 text-[#00304D]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-[#FDC300]">{totalPending}</div>
                <p className="text-sm text-gray-600">Pendientes</p>
              </div>
              <Clock className="h-8 w-8 text-[#FDC300]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-[#007832]">{resultsData.length}</div>
                <p className="text-sm text-gray-600">Competencias Total</p>
              </div>
              <FileText className="h-8 w-8 text-[#007832]" />
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
                placeholder="Buscar por ficha, nombre o competencia..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              {["Todos", "Completo", "Incompleto"].map((status) => (
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

      {/* Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Results List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredResults.map((result) => (
            <Card 
              key={result.id} 
              className={`border-l-4 cursor-pointer hover:shadow-md transition-shadow ${
                selectedResult?.id === result.id ? 'ring-2 ring-[#39A900]' : ''
              }`}
              style={{ borderLeftColor: result.color }}
              onClick={() => setSelectedResult(result)}
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg text-[#00304D]">Ficha {result.ficha}</h3>
                        {getStatusBadge(result.status)}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{result.fichaName}</p>
                      <p className="text-sm text-gray-500">{result.competency}</p>
                    </div>
                  </div>

                  {/* Progress */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Progreso de evidencias</span>
                      <span className="text-sm font-medium" style={{ color: result.color }}>
                        {result.progress}%
                      </span>
                    </div>
                    <Progress value={result.progress} className="h-2" />
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-xl font-bold text-[#00304D]">{result.totalStudents}</div>
                      <p className="text-xs text-gray-600">Aprendices</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-xl font-bold text-[#39A900]">{result.uploadedFiles}</div>
                      <p className="text-xs text-gray-600">Subidos</p>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <div className="text-xl font-bold text-[#FDC300]">{result.pendingFiles}</div>
                      <p className="text-xs text-gray-600">Pendientes</p>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    Última actualización: {new Date(result.lastUpdate).toLocaleDateString('es-CO')}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Details Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Evidencias Cargadas</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedResult ? (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-sm text-[#00304D] mb-1">
                    Ficha {selectedResult.ficha}
                  </h4>
                  <p className="text-xs text-gray-600">{selectedResult.fichaName}</p>
                </div>

                <Button 
                  className="w-full bg-[#39A900] hover:bg-[#2d8000]"
                  onClick={() => onOpenModal?.('uploadResult', selectedResult)}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Subir Nueva Evidencia
                </Button>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Archivos subidos:</p>
                  {selectedResult.files.map((file, index) => (
                    <div key={index} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-[#39A900]" />
                          <span className="text-sm font-medium text-[#00304D]">{file.name}</span>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={file.status === "Aprobado" ? "border-[#39A900] text-[#39A900]" : ""}
                        >
                          {file.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">{new Date(file.date).toLocaleDateString('es-CO')}</p>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedResult.pendingFiles > 0 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>{selectedResult.pendingFiles}</strong> archivo(s) pendiente(s) por subir
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">
                  Selecciona una competencia para ver las evidencias
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
