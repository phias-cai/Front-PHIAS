import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Mail, AlertCircle, Loader2, KeyRound } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const success = await login(email, password);

    if (!success) {
      setError('Credenciales inválidas. Por favor, verifica tu correo y contraseña.');
    }
    
    setLoading(false);
  };

  const handleResetPassword = async () => {
    setResetLoading(true);
    setError('');
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setResetSuccess(true);
      setTimeout(() => {
        setResetPasswordOpen(false);
        setResetSuccess(false);
        setResetEmail('');
      }, 3000);
    } catch (error: any) {
      setError(error.message || 'Error al enviar el correo de recuperación');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Imagen de fondo del CAI */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('/cai.jpg')`,
          filter: 'brightness(0.6)'
        }}
      />
      
      {/* Overlay con degradado institucional */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#00304D]/90 via-[#007832]/85 to-[#39A900]/90" />

      {/* Contenido */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo SENA arriba */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-2xl">
            <img 
              src="/sena.png" 
              alt="SENA Logo" 
              className="h-20 w-auto"
            />
          </div>
        </div>

        {/* Card de Login con Glassmorphism */}
        <Card className="bg-white/95 backdrop-blur-md border-white/20 shadow-2xl">
          <CardHeader className="space-y-3 text-center pb-4">
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-[#00304D] to-[#39A900] bg-clip-text text-transparent">
              PHIAS
            </CardTitle>
            <CardDescription className="text-base text-gray-700">
              Sistema de Programación de Horarios
              <br />
              <span className="text-sm text-[#39A900] font-semibold">
                Centro de Automatización Industrial - Manizales
              </span>
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-semibold">
                  Correo Electrónico
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tucorreo@sena.edu.co"
                    className="pl-11 h-12 border-gray-300 focus:border-[#39A900] focus:ring-[#39A900]"
                    value={email}
                    autoComplete="username"
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-semibold">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="pl-11 h-12 border-gray-300 focus:border-[#39A900] focus:ring-[#39A900]"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Link para cambiar contraseña */}
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setResetPasswordOpen(true)}
                  className="text-sm text-[#00304D] hover:text-[#39A900] font-medium transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-[#39A900] hover:bg-[#2d8000] text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-5 w-5" />
                    Iniciar Sesión
                  </>
                )}
              </Button>
            </form>

            {/* Footer del card */}
            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-500">
                Sistema exclusivo para personal autorizado del SENA
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer con copyright */}
        <div className="mt-6 text-center">
          <p className="text-sm text-white/90 drop-shadow-lg">
            © {new Date().getFullYear()} SENA - Servicio Nacional de Aprendizaje
          </p>
        </div>
      </div>

      {/* Modal de Recuperación de Contraseña */}
      <Dialog open={resetPasswordOpen} onOpenChange={setResetPasswordOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#00304D]">
              <KeyRound className="h-5 w-5 text-[#39A900]" />
              Recuperar Contraseña
            </DialogTitle>
            <DialogDescription>
              Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
            </DialogDescription>
          </DialogHeader>

          {resetSuccess ? (
            <Alert className="bg-green-50 border-green-200">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                ¡Correo enviado! Revisa tu bandeja de entrada para restablecer tu contraseña.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Correo Electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="tucorreo@sena.edu.co"
                      className="pl-10"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setResetPasswordOpen(false)}
                  disabled={resetLoading}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  className="bg-[#39A900] hover:bg-[#2d8000]"
                  onClick={handleResetPassword}
                  disabled={!resetEmail || resetLoading}
                >
                  {resetLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    'Enviar Enlace'
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}