import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { 
  Calendar, 
  BookOpen, 
  Users, 
  Award, 
  Target, 
  FileText, 
  Building2,
  TrendingUp,
  Clock,
  ArrowRight
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const statsData = [
  { 
    title: "Instructores", 
    value: "48", 
    change: "+12%", 
    icon: Users, 
    color: "#39A900" 
  },
  { 
    title: "Fichas Activas", 
    value: "24", 
    change: "+8%", 
    icon: BookOpen, 
    color: "#00304D" 
  },
  { 
    title: "Programas", 
    value: "16", 
    change: "+3%", 
    icon: Award, 
    color: "#007832" 
  },
  { 
    title: "Horarios Hoy", 
    value: "32", 
    change: "+24%", 
    icon: Calendar, 
    color: "#71277A" 
  },
];

interface QuickAccessCard {
  title: string;
  description: string;
  icon: any;
  color: string;
  action: string;
  bgColor: string;
}

const quickAccessCards: QuickAccessCard[] = [
  {
    title: "Calendario",
    description: "Visualiza y gestiona los horarios programados",
    icon: Calendar,
    color: "#39A900",
    bgColor: "#39A90010",
    action: "calendar"
  },
  {
    title: "Fichas",
    description: "Administra las fichas de formación activas",
    icon: BookOpen,
    color: "#00304D",
    bgColor: "#00304D10",
    action: "fichas"
  },
  {
    title: "Instructores",
    description: "Gestiona el personal docente del centro",
    icon: Users,
    color: "#007832",
    bgColor: "#00783210",
    action: "instructors"
  },
  {
    title: "Programas",
    description: "Consulta los programas de formación",
    icon: Award,
    color: "#71277A",
    bgColor: "#71277A10",
    action: "programs"
  },
  {
    title: "Competencias",
    description: "Visualiza competencias y resultados de aprendizaje",
    icon: Target,
    color: "#FDC300",
    bgColor: "#FDC30010",
    action: "competencies"
  },
  {
    title: "Ambientes",
    description: "Administra los ambientes de formación",
    icon: Building2,
    color: "#50E5F9",
    bgColor: "#50E5F910",
    action: "environments"
  },
];

const recentActivity = [
  { action: "Nuevo horario creado", ficha: "Ficha 2559874", time: "Hace 5 minutos", color: "#39A900" },
  { action: "Instructor asignado", instructor: "María González", time: "Hace 15 minutos", color: "#00304D" },
  { action: "Competencia actualizada", programa: "Desarrollo de Software", time: "Hace 1 hora", color: "#007832" },
  { action: "Ambiente reservado", ambiente: "Ambiente 201", time: "Hace 2 horas", color: "#71277A" },
];

interface HomeProps {
  onNavigate: (view: string) => void;
}

export function Home({ onNavigate }: HomeProps) {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-[#00304D]">
          Bienvenido, {user?.name}
        </h1>
        <p className="text-gray-600 mt-1">
          {user?.role === 'admin' && 'Panel de administración del sistema'}
          {user?.role === 'coordinador' && 'Panel de coordinación académica'}
          {user?.role === 'instructor' && 'Panel de consulta de horarios'}
          {user?.role === 'asistente' && 'Panel de consulta del sistema'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border-l-4" style={{ borderLeftColor: stat.color }}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <Icon className="h-5 w-5" style={{ color: stat.color }} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" style={{ color: stat.color }}>
                  {stat.value}
                </div>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  {stat.change} vs mes anterior
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Access Section */}
      <div>
        <h2 className="text-xl font-bold text-[#00304D] mb-4">Acceso Rápido</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickAccessCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Card 
                key={index} 
                className="hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => onNavigate(card.action)}
              >
                <CardContent className="p-6">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: card.bgColor }}
                  >
                    <Icon className="h-6 w-6" style={{ color: card.color }} />
                  </div>
                  <h3 className="text-lg font-bold text-[#00304D] mb-2">
                    {card.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {card.description}
                  </p>
                  <Button 
                    variant="ghost" 
                    className="p-0 h-auto group-hover:text-[#39A900] transition-colors"
                    style={{ color: card.color }}
                  >
                    Ir al módulo
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Actividad Reciente</CardTitle>
              <CardDescription>Últimas acciones en el sistema</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              Ver todo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-b-0">
                <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: activity.color }} />
                <div className="flex-1">
                  <p className="font-medium text-[#00304D]">{activity.action}</p>
                  <p className="text-sm text-gray-500">
                    {activity.ficha || activity.instructor || activity.programa || activity.ambiente}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-400">
                  <Clock className="h-3 w-3" />
                  {activity.time}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
