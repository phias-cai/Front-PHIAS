import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Users, 
  BookOpen, 
  MapPin, 
  Clock,
  ArrowRight,
  Activity,
  Award,
  Zap
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Stats {
  totalFichas: number;
  totalInstructores: number;
  totalAmbientes: number;
  horariosActivos: number;
  programasActivos: number;
}

interface HomeProps {
  onNavigate: (view: string) => void;
}

export function Home({ onNavigate }: HomeProps) {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalFichas: 0,
    totalInstructores: 0,
    totalAmbientes: 0,
    horariosActivos: 0,
    programasActivos: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const [fichas, instructores, ambientes, horarios, programas] = await Promise.all([
        supabase.from('fichas').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('rol', 'instructor'),
        supabase.from('ambientes').select('id', { count: 'exact', head: true }),
        supabase.from('horarios').select('id', { count: 'exact', head: true }),
        supabase.from('programas').select('id', { count: 'exact', head: true })
      ]);

      setStats({
        totalFichas: fichas.count || 0,
        totalInstructores: instructores.count || 0,
        totalAmbientes: ambientes.count || 0,
        horariosActivos: horarios.count || 0,
        programasActivos: programas.count || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Gestionar Horarios',
      description: 'Crear y organizar horarios de formación',
      icon: Calendar,
      color: 'from-[#39A900] to-[#2d8000]',
      link: 'horarios',
      stat: stats.horariosActivos,
      statLabel: 'activos'
    },
    {
      title: 'Instructores',
      description: 'Administrar equipo docente',
      icon: Users,
      color: 'from-[#00304D] to-[#001a2d]',
      link: 'instructors',
      stat: stats.totalInstructores,
      statLabel: 'registrados'
    },
    {
      title: 'Fichas de Formación',
      description: 'Gestión de grupos de aprendices',
      icon: BookOpen,
      color: 'from-[#71277A] to-[#4d1a52]',
      link: 'fichas',
      stat: stats.totalFichas,
      statLabel: 'activas'
    },
    {
      title: 'Ambientes',
      description: 'Espacios físicos del centro',
      icon: MapPin,
      color: 'from-[#007832] to-[#005020]',
      link: 'environments',
      stat: stats.totalAmbientes,
      statLabel: 'disponibles'
    }
  ];

  const metrics = [
    { 
      label: 'Programas Activos', 
      value: stats.programasActivos, 
      icon: Award,
      trend: '+12%',
      trendUp: true
    },
    { 
      label: 'Tasa de Ocupación', 
      value: '87%', 
      icon: Activity,
      trend: '+5%',
      trendUp: true
    },
    { 
      label: 'Horas Programadas', 
      value: '1,240', 
      icon: Clock,
      trend: '+8%',
      trendUp: true
    },
    { 
      label: 'Eficiencia', 
      value: '94%', 
      icon: Zap,
      trend: '+3%',
      trendUp: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 -m-8">
      {/* Hero Section con Imagen del CAI */}
      <div className="relative h-[380px] overflow-hidden">
        {/* Imagen de fondo */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('/cai.jpg')`,
            filter: 'brightness(0.85)'
          }}
        />
        
        {/* Overlay con degradado SENA institucional - MUY transparente */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#00304D]/30 via-[#007832]/20 to-[#39A900]/30" />
        
        {/* Contenido Hero */}
        <div className="relative h-full flex items-center justify-center px-4">
          <div className="max-w-6xl mx-auto text-center">
            {/* Título Principal - Sin logo SENA, sin "Sistema de Gestión" */}
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight drop-shadow-lg">
              <span className="block bg-gradient-to-r from-[#39A900] to-[#50E5F9] bg-clip-text text-transparent drop-shadow-lg">
                PHIAS
              </span>
            </h1>

            {/* Acrónimo explicado */}
            <div className="mb-4 inline-block">
              <div className="bg-white/90 backdrop-blur-sm rounded-lg px-6 py-3 border border-white/40 shadow-xl">
                <p className="text-sm md:text-base text-[#00304D] font-semibold">
                  <span className="text-[#39A900] font-bold">P</span>rogramador de{' '}
                  <span className="text-[#39A900] font-bold">H</span>orarios,{' '}
                  <span className="text-[#39A900] font-bold">I</span>nstructores,{' '}
                  <span className="text-[#39A900] font-bold">A</span>mbientes -{' '}
                  <span className="text-[#39A900] font-bold">S</span>ENA
                </p>
              </div>
            </div>
            
            <p className="text-lg md:text-xl text-white font-semibold max-w-3xl mx-auto drop-shadow-lg">
              Centro de Automatización Industrial - Manizales
            </p>
          </div>
        </div>

        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M0,64L60,69.3C120,75,240,85,360,80C480,75,600,53,720,48C840,43,960,53,1080,58.7C1200,64,1320,64,1380,64L1440,64L1440,120L1380,120C1320,120,1200,120,1080,120C960,120,840,120,720,120C600,120,480,120,360,120C240,120,120,120,60,120L0,120Z" 
              fill="rgb(249, 250, 251)"
            />
          </svg>
        </div>
      </div>

      {/* Metrics Dashboard */}
      <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-10 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300
                         border border-gray-100 hover:scale-105"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-[#39A900]/10 rounded-xl">
                    <Icon className="w-6 h-6 text-[#39A900]" />
                  </div>
                  <span className={`text-sm font-semibold px-2 py-1 rounded-lg ${
                    metric.trendUp 
                      ? 'bg-[#39A900]/10 text-[#39A900]' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {metric.trend}
                  </span>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">{metric.label}</h3>
                <p className="text-3xl font-bold text-[#00304D]">{metric.value}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[#00304D] mb-4">Acceso Rápido</h2>
          <p className="text-gray-600 text-lg">Gestiona las funcionalidades principales del sistema</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={() => onNavigate(action.link)}
                className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl 
                         transition-all duration-300 overflow-hidden hover:-translate-y-2 text-left w-full"
              >
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 
                              group-hover:opacity-5 transition-opacity duration-300`} />
                
                {/* Icon */}
                <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${action.color} 
                              shadow-lg group-hover:scale-110 transition-transform duration-300 mb-6`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-[#00304D] mb-3 group-hover:text-[#39A900] transition-colors">
                  {action.title}
                </h3>
                <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                  {action.description}
                </p>

                {/* Stats Badge */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <span className="text-2xl font-bold text-[#00304D]">{action.stat}</span>
                    <span className="text-sm text-gray-500 ml-2">{action.statLabel}</span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#39A900] 
                                       group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Botones de Acción - Al final */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="flex flex-wrap gap-4 justify-center">
          <button 
            onClick={() => onNavigate('horarios')}
            className="group px-8 py-4 bg-[#39A900] text-white rounded-xl font-bold text-lg
                     hover:bg-[#2d8000] transition-all duration-300 flex items-center gap-2
                     shadow-2xl hover:shadow-3xl hover:scale-105"
          >
            Ver Horarios
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button 
            onClick={() => onNavigate('calendar')}
            className="px-8 py-4 bg-[#00304D] text-white rounded-xl font-bold text-lg
                     hover:bg-[#001a2d] transition-all duration-300
                     border-2 border-[#00304D] shadow-2xl hover:shadow-3xl hover:scale-105"
          >
            Ver Calendario
          </button>
        </div>
      </div>
    </div>
  );
}