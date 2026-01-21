import { MapPin, Phone, Mail, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gradient-to-r from-[#00304D] via-[#007832] to-[#39A900]">
      <div className="container mx-auto px-8 py-8">
        {/* Contenido principal en una sola fila */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Info del Centro */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-white">
              <MapPin className="h-5 w-5 text-[#50E5F9]" />
              <div>
                <p className="font-bold text-sm">Centro de Automatización Industrial</p>
                <p className="text-xs text-gray-200">Manizales, Caldas</p>
              </div>
            </div>
          </div>

          {/* Contacto */}
          <div className="flex flex-col md:flex-row gap-4 text-sm text-gray-100">
            <a 
              href="tel:+576068727272" 
              className="flex items-center gap-2 hover:text-white transition-colors"
            >
              <Phone className="h-4 w-4" />
              <span>(+57) 606 872 7272</span>
            </a>
            <a 
              href="mailto:cai@sena.edu.co" 
              className="flex items-center gap-2 hover:text-white transition-colors"
            >
              <Mail className="h-4 w-4" />
              <span>cai@sena.edu.co</span>
            </a>
          </div>

          {/* Copyright */}
          <div className="text-xs text-gray-200 flex items-center gap-1">
            <span>Hecho con</span>
            <Heart className="h-3 w-3 text-red-400 fill-current" />
            <span>© {new Date().getFullYear()} SENA</span>
          </div>
        </div>
      </div>
    </footer>
  );
}