import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  BookOpen, 
  Award, 
  Target, 
  FileText,
  User,
  Settings,
  LogOut,
  Building2
} from "lucide-react";
import { SenaLogo } from "./SenaLogo";
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

  const canAccessItem = (itemRoles: UserRole[]) => {
    if (!user) return false;
    return itemRoles.includes(user.role);
  };

  const filteredMenuItems = menuItems.filter(item => canAccessItem(item.roles as UserRole[]));

  return (
    <div className="w-64 min-h-screen bg-[#00304D] text-white flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-[#39A900] flex items-center justify-center">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Phias</h1>
            <p className="text-xs text-gray-300">Sistema de Horarios</p>
          </div>
        </div>
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
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-[#39A900] text-white"
                  : "text-gray-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 mb-2">
          <div className="w-10 h-10 rounded-full bg-[#39A900] flex items-center justify-center">
            <User className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="flex-1 text-gray-300 hover:text-white hover:bg-white/10"
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="flex-1 text-gray-300 hover:text-white hover:bg-white/10"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* SENA Branding */}
      <div className="p-4 border-t border-white/10">
        <SenaLogo className="w-32 h-auto mx-auto opacity-75" />
      </div>
    </div>
  );
}