import { SenaLogo } from "./SenaLogo";
import { MapPin, Phone, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#00304D] text-white mt-auto">
      <div className="container mx-auto px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Logo and System Name */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-[#39A900] flex items-center justify-center flex-shrink-0">
              <SenaLogo className="w-10 h-10" />
            </div>
            <div>
              <h3 className="font-bold text-lg">PHIAS</h3>
              <p className="text-xs text-gray-300">Sistema de Horarios</p>
            </div>
          </div>

          {/* Center Info */}
          <div className="text-center">
            <p className="font-medium mb-1">Centro de Automatización Industrial</p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-300">
              <MapPin className="h-3 w-3" />
              <span>Manizales, Caldas</span>
            </div>
          </div>

          {/* Contact Info */}
          <div className="text-sm text-gray-300 space-y-1 md:text-right">
            <div className="flex items-center gap-2 md:justify-end">
              <Phone className="h-3 w-3" />
              <span>(+57) 606 872 7272</span>
            </div>
            <div className="flex items-center gap-2 md:justify-end">
              <Mail className="h-3 w-3" />
              <span>cai@sena.edu.co</span>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-6 pt-4 text-center text-xs text-gray-400">
          <p>© {new Date().getFullYear()} SENA - Servicio Nacional de Aprendizaje. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
