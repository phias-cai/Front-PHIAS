import { useState } from "react";
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  BookOpen, 
  Award, 
  Target, 
  FileText,
  User,
  LogOut,
  Building2,
  Lock,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "./ui/button";
import { useAuth, UserRole } from "../contexts/AuthContext";

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const menuItems = [
  { id: "home", label: "Inicio", icon: LayoutDashboard, roles: ['admin', 'coordinador', 'instructor', 'asistente'] },
  { id: "calendar", label: "Calendario", icon: Calendar, roles: ['admin', 'coordinador', 'instructor', 'asistente'] },
  { id: "instructors", label: "Instructores", icon: Users, roles: ['admin', 'coordinador'] },
  { id: "fichas", label: "Fichas", icon: BookOpen, roles: ['admin', 'coordinador', 'instructor', 'asistente'] },
  { id: "programs", label: "Programas", icon: Award, roles: ['admin', 'coordinador', 'instructor', 'asistente'] },
  { id: "competencies", label: "Competencias", icon: Target, roles: ['admin', 'coordinador', 'instructor'] },
  { id: "environments", label: "Ambientes", icon: Building2, roles: ['admin', 'coordinador'] },
  { id: "results", label: "Resultados", icon: FileText, roles: ['admin', 'coordinador', 'instructor'] },
  { id: "users", label: "Usuarios", icon: User, roles: ['admin'] },
];

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const canAccessItem = (itemRoles: UserRole[]) => {
    if (!user) return false;
    return itemRoles.includes(user.role);
  };

  const filteredMenuItems = menuItems.filter(item => canAccessItem(item.roles as UserRole[]));

  return (
    <div 
      className={`min-h-screen bg-gradient-to-b from-[#00304D] via-[#003d5c] to-[#00304D] text-white flex flex-col shadow-2xl transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo Section - Modernizado con logo SENA */}
      <div className="p-6 border-b border-white/10 relative">
        {!isCollapsed ? (
          <div className="flex items-center gap-3">
            {/* Logo SENA PNG */}
            <div className="w-12 h-12 bg-[#00304D] rounded-xl flex items-center justify-center p-1.5 shadow-lg">
              <img 
                src="/phias.png" 
                alt="SENA" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                PHIAS
              </h1>
              <p className="text-xs text-[#39A900] font-semibold">CAI Manizales</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-[#00304D]  rounded-xl flex items-center justify-center p-1.5 shadow-lg">
              <img 
                src="/phias.png" 
                alt="SENA" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        )}

        {/* Botón Toggle - Posicionado absolutamente */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-8 w-6 h-6 bg-[#39A900] rounded-full flex items-center justify-center text-white hover:bg-[#2d8000] transition-all duration-200 shadow-lg hover:scale-110"
          title={isCollapsed ? "Expandir" : "Colapsar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-[#39A900] text-white shadow-lg shadow-[#39A900]/30 scale-105"
                  : "text-gray-300 hover:bg-white/5 hover:text-white hover:translate-x-1"
              } ${isCollapsed ? 'justify-center' : ''}`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className={`h-5 w-5 ${isCollapsed ? '' : 'flex-shrink-0'}`} />
              {!isCollapsed && <span className="font-medium">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-white/10">
        {!isCollapsed ? (
          <>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 mb-3 border border-white/10">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#39A900] to-[#2d8000] flex items-center justify-center shadow-lg flex-shrink-0">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{user?.name}</p>
                <p className="text-xs text-[#39A900] capitalize font-medium">{user?.role}</p>
              </div>
            </div>
            
            {/* Botones de usuario */}
            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200"
                onClick={() => onViewChange('change-password')}
              >
                <Lock className="h-4 w-4 mr-2" />
                Cambiar Contraseña
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-300 hover:text-white hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 rounded-xl transition-all duration-200"
                onClick={async () => await logout()}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Usuario colapsado - solo avatar */}
            <div className="flex justify-center mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#39A900] to-[#2d8000] flex items-center justify-center shadow-lg">
                <User className="h-5 w-5 text-white" />
              </div>
            </div>
            
            {/* Botones colapsados - solo iconos */}
            <div className="space-y-2 flex flex-col items-center">
              <button
                onClick={() => onViewChange('change-password')}
                className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200"
                title="Cambiar Contraseña"
              >
                <Lock className="h-5 w-5" />
              </button>
              
              <button
                onClick={async () => await logout()}
                className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-white hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 rounded-xl transition-all duration-200"
                title="Cerrar Sesión"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </>
        )}
      </div>

    
    </div>
  );
}