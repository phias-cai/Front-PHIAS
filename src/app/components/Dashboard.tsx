import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Users, BookOpen, Calendar, Award, FileText, TrendingUp } from "lucide-react";

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
    title: "Horarios", 
    value: "156", 
    change: "+24%", 
    icon: Calendar, 
    color: "#71277A" 
  },
];

const weeklyScheduleData = [
  { day: "Lun", clases: 28, instructores: 12 },
  { day: "Mar", clases: 32, instructores: 14 },
  { day: "Mié", clases: 30, instructores: 13 },
  { day: "Jue", clases: 35, instructores: 15 },
  { day: "Vie", clases: 26, instructores: 11 },
  { day: "Sáb", clases: 18, instructores: 8 },
];

const programDistribution = [
  { name: "Tecnología", value: 35, color: "#39A900" },
  { name: "Administración", value: 28, color: "#00304D" },
  { name: "Diseño", value: 20, color: "#007832" },
  { name: "Otros", value: 17, color: "#71277A" },
];

const monthlyTrend = [
  { mes: "Ene", horarios: 120 },
  { mes: "Feb", horarios: 135 },
  { mes: "Mar", horarios: 142 },
  { mes: "Abr", horarios: 156 },
];

export function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#00304D]">Dashboard</h1>
        <p className="text-gray-600 mt-1">Resumen general del sistema de horarios</p>
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

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Schedule Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Horarios Semanales</CardTitle>
            <CardDescription>Clases e instructores por día</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyScheduleData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="clases" fill="#39A900" name="Clases" />
                <Bar dataKey="instructores" fill="#00304D" name="Instructores" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Program Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Programa</CardTitle>
            <CardDescription>Fichas por área de formación</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={programDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {programDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Tendencia de Horarios</CardTitle>
            <CardDescription>Evolución mensual de horarios programados</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="horarios" 
                  stroke="#39A900" 
                  strokeWidth={3}
                  name="Horarios"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>Últimas acciones en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { action: "Nuevo horario creado", ficha: "Ficha 2559874", time: "Hace 5 minutos", color: "#39A900" },
              { action: "Instructor asignado", instructor: "María González", time: "Hace 15 minutos", color: "#00304D" },
              { action: "Competencia actualizada", programa: "Desarrollo de Software", time: "Hace 1 hora", color: "#007832" },
              { action: "Resultado de aprendizaje agregado", ficha: "Ficha 2445621", time: "Hace 2 horas", color: "#71277A" },
            ].map((activity, index) => (
              <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-b-0">
                <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: activity.color }} />
                <div className="flex-1">
                  <p className="font-medium text-[#00304D]">{activity.action}</p>
                  <p className="text-sm text-gray-500">
                    {activity.ficha || activity.instructor || activity.programa}
                  </p>
                </div>
                <span className="text-sm text-gray-400">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
