// src/components/Users.tsx
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Alert, AlertDescription } from "./ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { Search, Plus, Shield, Mail, Calendar, Edit, Trash2, Loader2, CheckCircle, XCircle, Key, UserX, UserCheck } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useAuth } from "../contexts/AuthContext";

interface UserData {
  id: string;
  nombres: string;
  email: string;
  rol: string;
  documento?: string;
  area?: string;
  telefono?: string;
  is_active: boolean;
  created_at: string;
}

const roles = [
  { name: "admin", displayName: "Administrador", color: "#00304D", level: "Alto" },
  { name: "coordinador", displayName: "Coordinador", color: "#007832", level: "Alto" },
  { name: "instructor", displayName: "Instructor", color: "#39A900", level: "Medio" },
  { name: "asistente", displayName: "Asistente", color: "#FDC300", level: "Básico" },
];

export function Users() {
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para modales
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Estados para operaciones
  const [operationLoading, setOperationLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  
  // Usuario seleccionado para editar/eliminar
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  
  // Formulario crear usuario
  const [createFormData, setCreateFormData] = useState({
    email: '',
    nombres: '',
    password: '',
    confirmPassword: '',
    rol: 'asistente',
    documento: '',
    area: '',
    telefono: '',
  });

  // Formulario editar usuario
  const [editFormData, setEditFormData] = useState({
    nombres: '',
    rol: 'asistente',
    documento: '',
    area: '',
    telefono: '',
    is_active: true,
  });

  // Formulario cambiar contraseña
  const [passwordFormData, setPasswordFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  // Cargar usuarios
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ============================================
  // CREAR USUARIO
  // ============================================
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setOperationLoading(true);
    setResult(null);

    if (createFormData.password !== createFormData.confirmPassword) {
      setResult({ success: false, message: 'Las contraseñas no coinciden' });
      setOperationLoading(false);
      return;
    }

    if (createFormData.password.length < 6) {
      setResult({ success: false, message: 'La contraseña debe tener al menos 6 caracteres' });
      setOperationLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('admin_create_user', {
        p_email: createFormData.email,
        p_nombres: createFormData.nombres,
        p_password: createFormData.password,
        p_rol: createFormData.rol,
        p_documento: createFormData.documento || null,
        p_area: createFormData.area || null,
        p_telefono: createFormData.telefono || null,
      });

      if (error) throw error;

      const response = typeof data === 'string' ? JSON.parse(data) : data;

      if (response.success) {
        setResult({ success: true, message: `Usuario ${createFormData.nombres} creado exitosamente` });
        setCreateFormData({
          email: '', nombres: '', password: '', confirmPassword: '',
          rol: 'asistente', documento: '', area: '', telefono: '',
        });
        fetchUsers();
        setTimeout(() => {
          setCreateDialogOpen(false);
          setResult(null);
        }, 2000);
      } else {
        throw new Error(response.error || 'Error desconocido');
      }
    } catch (error: any) {
      setResult({ success: false, message: error.message || 'Error al crear usuario' });
    } finally {
      setOperationLoading(false);
    }
  };

  // ============================================
  // EDITAR USUARIO
  // ============================================
  const openEditDialog = (user: UserData) => {
    setSelectedUser(user);
    setEditFormData({
      nombres: user.nombres,
      rol: user.rol,
      documento: user.documento || '',
      area: user.area || '',
      telefono: user.telefono || '',
      is_active: user.is_active,
    });
    setEditDialogOpen(true);
    setResult(null);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setOperationLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.rpc('admin_update_user', {
        p_user_id: selectedUser.id,
        p_nombres: editFormData.nombres,
        p_rol: editFormData.rol,
        p_documento: editFormData.documento || null,
        p_area: editFormData.area || null,
        p_telefono: editFormData.telefono || null,
        p_is_active: editFormData.is_active,
      });

      if (error) throw error;

      const response = typeof data === 'string' ? JSON.parse(data) : data;

      if (response.success) {
        setResult({ success: true, message: 'Usuario actualizado exitosamente' });
        fetchUsers();
        setTimeout(() => {
          setEditDialogOpen(false);
          setResult(null);
          setSelectedUser(null);
        }, 2000);
      } else {
        throw new Error(response.error || 'Error desconocido');
      }
    } catch (error: any) {
      setResult({ success: false, message: error.message || 'Error al actualizar usuario' });
    } finally {
      setOperationLoading(false);
    }
  };

  // ============================================
  // CAMBIAR CONTRASEÑA
  // ============================================
  const openPasswordDialog = (user: UserData) => {
    setSelectedUser(user);
    setPasswordFormData({ newPassword: '', confirmPassword: '' });
    setPasswordDialogOpen(true);
    setResult(null);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      setResult({ success: false, message: 'Las contraseñas no coinciden' });
      return;
    }

    if (passwordFormData.newPassword.length < 6) {
      setResult({ success: false, message: 'La contraseña debe tener al menos 6 caracteres' });
      return;
    }

    setOperationLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.rpc('admin_change_password', {
        p_user_id: selectedUser.id,
        p_new_password: passwordFormData.newPassword,
      });

      if (error) throw error;

      const response = typeof data === 'string' ? JSON.parse(data) : data;

      if (response.success) {
        setResult({ success: true, message: 'Contraseña actualizada exitosamente' });
        setPasswordFormData({ newPassword: '', confirmPassword: '' });
        setTimeout(() => {
          setPasswordDialogOpen(false);
          setResult(null);
          setSelectedUser(null);
        }, 2000);
      } else {
        throw new Error(response.error || 'Error desconocido');
      }
    } catch (error: any) {
      setResult({ success: false, message: error.message || 'Error al cambiar contraseña' });
    } finally {
      setOperationLoading(false);
    }
  };

  // ============================================
  // DESACTIVAR/ACTIVAR USUARIO
  // ============================================
  const openDeleteDialog = (user: UserData) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
    setResult(null);
  };

  const handleToggleUserStatus = async () => {
    if (!selectedUser) return;

    setOperationLoading(true);

    try {
      const functionName = selectedUser.is_active 
        ? 'admin_deactivate_user' 
        : 'admin_activate_user';

      const { data, error } = await supabase.rpc(functionName, {
        p_user_id: selectedUser.id,
      });

      if (error) throw error;

      const response = typeof data === 'string' ? JSON.parse(data) : data;

      if (response.success) {
        fetchUsers();
        setDeleteDialogOpen(false);
        setSelectedUser(null);
      } else {
        throw new Error(response.error || 'Error desconocido');
      }
    } catch (error: any) {
      alert(error.message || 'Error al cambiar estado del usuario');
    } finally {
      setOperationLoading(false);
    }
  };

  // ============================================
  // UTILIDADES
  // ============================================
  const filteredUsers = users.filter(user =>
    user.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.rol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  const getRoleBadgeColor = (role: string) => {
    const roleData = roles.find(r => r.name === role);
    return roleData?.color || "#000000";
  };

  const getRoleDisplayName = (role: string) => {
    const roleData = roles.find(r => r.name === role);
    return roleData?.displayName || role;
  };

  const getRandomColor = (email: string) => {
    const colors = ["#39A900", "#00304D", "#007832", "#71277A", "#FDC300", "#50E5F9"];
    const index = email.length % colors.length;
    return colors[index];
  };

  const stats = {
    total: users.length,
    activos: users.filter(u => u.is_active).length,
    instructores: users.filter(u => u.rol === 'instructor').length,
    coordinadores: users.filter(u => u.rol === 'coordinador' || u.rol === 'admin').length,
  };

  const canManageUsers = currentUser?.role === 'admin' || currentUser?.role === 'coordinador';

  return (
     <div className="min-h-screen relative">
    {/* Imagen de fondo MUY sutil */}
    <div 
      className="fixed inset-0 bg-cover bg-center pointer-events-none"
      style={{
        backgroundImage: `url('/cai.jpg')`,
        filter: 'brightness(1.2)',
        opacity: '0.15'
      }}
    />
    
    {/* Contenido */}
    <div className="relative space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
     <img 
      src="/phias.png" 
      alt="PHIAS Logo" 
      className="h-12 w-auto relative z-10"
    />
          <h1 className="text-3xl font-bold text-[#00304D]">Usuarios</h1></div>
          <p className="text-gray-600 mt-1">Gestión de usuarios y permisos del sistema</p>
        </div>
        
        {canManageUsers && (
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#39A900] hover:bg-[#2d8000]">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Usuario
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                <DialogDescription>
                  Ingresa los datos del nuevo usuario del sistema PHIAS
                </DialogDescription>
              </DialogHeader>

              {result && (
                <Alert variant={result.success ? 'default' : 'destructive'}>
                  {result.success ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  <AlertDescription>{result.message}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico <span className="text-red-500">*</span></Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="usuario@sena.edu.co"
                    value={createFormData.email}
                    onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nombres">Nombres Completos <span className="text-red-500">*</span></Label>
                  <Input
                    id="nombres"
                    type="text"
                    placeholder="Juan Pérez García"
                    value={createFormData.nombres}
                    onChange={(e) => setCreateFormData({ ...createFormData, nombres: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rol">Rol <span className="text-red-500">*</span></Label>
                  <Select
                    value={createFormData.rol}
                    onValueChange={(value) => setCreateFormData({ ...createFormData, rol: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="coordinador">Coordinador</SelectItem>
                      <SelectItem value="instructor">Instructor</SelectItem>
                      <SelectItem value="asistente">Asistente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña <span className="text-red-500">*</span></Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={createFormData.password}
                      onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
                      required
                      minLength={6}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Contraseña <span className="text-red-500">*</span></Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Repetir contraseña"
                      value={createFormData.confirmPassword}
                      onChange={(e) => setCreateFormData({ ...createFormData, confirmPassword: e.target.value })}
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="documento">Documento de Identidad</Label>
                  <Input
                    id="documento"
                    type="text"
                    placeholder="1234567890"
                    value={createFormData.documento}
                    onChange={(e) => setCreateFormData({ ...createFormData, documento: e.target.value })}
                  />
                </div>

                {createFormData.rol === 'instructor' && (
                  <div className="space-y-2">
                    <Label htmlFor="area">Área de Expertise</Label>
                    <Input
                      id="area"
                      type="text"
                      placeholder="Programación, Electrónica, Diseño..."
                      value={createFormData.area}
                      onChange={(e) => setCreateFormData({ ...createFormData, area: e.target.value })}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    type="tel"
                    placeholder="3001234567"
                    value={createFormData.telefono}
                    onChange={(e) => setCreateFormData({ ...createFormData, telefono: e.target.value })}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#39A900] hover:bg-[#2d8000]"
                  disabled={operationLoading}
                >
                  {operationLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando usuario...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Crear Usuario
                    </>
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-[#39A900]">{stats.total}</div>
            <p className="text-sm text-gray-600">Total Usuarios</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-[#00304D]">{stats.activos}</div>
            <p className="text-sm text-gray-600">Activos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-[#007832]">{stats.instructores}</div>
            <p className="text-sm text-gray-600">Instructores</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-[#71277A]">{stats.coordinadores}</div>
            <p className="text-sm text-gray-600">Coordinadores</p>
          </CardContent>
        </Card>
      </div>

      {/* Roles Info */}
      <Card>
        <CardHeader>
          <CardTitle>Roles y Permisos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {roles.map((role, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="h-5 w-5" style={{ color: role.color }} />
                  <div>
                    <h4 className="font-medium text-[#00304D]">{role.displayName}</h4>
                    <p className="text-xs text-gray-500">Nivel: {role.level}</p>
                  </div>
                </div>
                <Badge style={{ backgroundColor: role.color }}>
                  {users.filter(u => u.rol === role.name).length} usuarios
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, email o rol..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={fetchUsers}>
              Actualizar
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#39A900]" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback 
                              style={{ 
                                backgroundColor: getRandomColor(user.email) + "30", 
                                color: getRandomColor(user.email) 
                              }}
                            >
                              {getInitials(user.nombres)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-[#00304D]">{user.nombres}</p>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge style={{ backgroundColor: getRoleBadgeColor(user.rol) }}>
                          {getRoleDisplayName(user.rol)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{user.documento || '-'}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{user.telefono || '-'}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={user.is_active ? "bg-[#39A900]" : "bg-gray-500"}>
                          {user.is_active ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {canManageUsers && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                title="Editar usuario"
                                onClick={() => openEditDialog(user)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                title="Cambiar contraseña"
                                onClick={() => openPasswordDialog(user)}
                              >
                                <Key className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className={user.is_active ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"}
                                title={user.is_active ? "Desactivar" : "Activar"}
                                onClick={() => openDeleteDialog(user)}
                                disabled={user.id === currentUser?.id}
                              >
                                {user.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Editar Usuario */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Modificar información de {selectedUser?.nombres}
            </DialogDescription>
          </DialogHeader>

          {result && (
            <Alert variant={result.success ? 'default' : 'destructive'}>
              {result.success ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleUpdateUser} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-nombres">Nombres Completos</Label>
              <Input
                id="edit-nombres"
                value={editFormData.nombres}
                onChange={(e) => setEditFormData({ ...editFormData, nombres: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-rol">Rol</Label>
              <Select
                value={editFormData.rol}
                onValueChange={(value) => setEditFormData({ ...editFormData, rol: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="coordinador">Coordinador</SelectItem>
                  <SelectItem value="instructor">Instructor</SelectItem>
                  <SelectItem value="asistente">Asistente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-documento">Documento</Label>
              <Input
                id="edit-documento"
                value={editFormData.documento}
                onChange={(e) => setEditFormData({ ...editFormData, documento: e.target.value })}
              />
            </div>

            {editFormData.rol === 'instructor' && (
              <div className="space-y-2">
                <Label htmlFor="edit-area">Área</Label>
                <Input
                  id="edit-area"
                  value={editFormData.area}
                  onChange={(e) => setEditFormData({ ...editFormData, area: e.target.value })}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="edit-telefono">Teléfono</Label>
              <Input
                id="edit-telefono"
                value={editFormData.telefono}
                onChange={(e) => setEditFormData({ ...editFormData, telefono: e.target.value })}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit-active"
                checked={editFormData.is_active}
                onChange={(e) => setEditFormData({ ...editFormData, is_active: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="edit-active">Usuario activo</Label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-[#39A900] hover:bg-[#2d8000]"
                disabled={operationLoading}
              >
                {operationLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar Cambios'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Cambiar Contraseña */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar Contraseña</DialogTitle>
            <DialogDescription>
              Nueva contraseña para {selectedUser?.nombres}
            </DialogDescription>
          </DialogHeader>

          {result && (
            <Alert variant={result.success ? 'default' : 'destructive'}>
              {result.success ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">Nueva Contraseña</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={passwordFormData.newPassword}
                onChange={(e) => setPasswordFormData({ ...passwordFormData, newPassword: e.target.value })}
                required
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-new-password">Confirmar Contraseña</Label>
              <Input
                id="confirm-new-password"
                type="password"
                placeholder="Repetir contraseña"
                value={passwordFormData.confirmPassword}
                onChange={(e) => setPasswordFormData({ ...passwordFormData, confirmPassword: e.target.value })}
                required
                minLength={6}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPasswordDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-[#39A900] hover:bg-[#2d8000]"
                disabled={operationLoading}
              >
                {operationLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cambiando...
                  </>
                ) : (
                  'Cambiar Contraseña'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* AlertDialog Desactivar/Activar */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedUser?.is_active ? '¿Desactivar usuario?' : '¿Activar usuario?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedUser?.is_active ? (
                <>
                  ¿Estás seguro de desactivar a <strong>{selectedUser?.nombres}</strong>? 
                  El usuario no podrá iniciar sesión hasta que sea reactivado.
                </>
              ) : (
                <>
                  ¿Estás seguro de activar a <strong>{selectedUser?.nombres}</strong>?
                  El usuario podrá iniciar sesión nuevamente.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggleUserStatus}
              className={selectedUser?.is_active ? "bg-red-600 hover:bg-red-700" : "bg-[#39A900] hover:bg-[#2d8000]"}
              disabled={operationLoading}
            >
              {operationLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                selectedUser?.is_active ? 'Desactivar' : 'Activar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
  </div>
  </div>

);
}