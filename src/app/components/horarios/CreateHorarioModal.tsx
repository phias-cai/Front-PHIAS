import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Alert, AlertDescription } from "../ui/alert";
import { Loader2, CheckCircle, XCircle, BookOpen, Users, Home } from "lucide-react";

interface CreateHorarioModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  fichas: any[];
  instructores: any[];
  ambientes: any[];
}

const diasSemana = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];

export function CreateHorarioModal({
  open,
  onClose,
  onSuccess,
  fichas,
  instructores,
  ambientes,
}: CreateHorarioModalProps) {
  
  const [activeTab, setActiveTab] = useState('clase');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  
  // Competencias y resultados (dinámicos)
  const [competencias, setCompetencias] = useState<any[]>([]);
  const [resultados, setResultados] = useState<any[]>([]);

  // Form CLASE
  const [formClase, setFormClase] = useState({
    ficha_id: '',
    competencia_id: '',
    resultado_id: '',
    instructor_id: '',
    ambiente_id: '',
    fecha_inicio: '',
    fecha_fin: '',
    dia_semana: 'LUNES',
    hora_inicio: '',
    hora_fin: '',
    apoyo: '',
    observaciones: '',
  });

  // Form APOYO
  const [formApoyo, setFormApoyo] = useState({
    instructor_id: '',
    apoyo_tipo: '',
    ambiente_id: '',
    fecha_inicio: '',
    fecha_fin: '',
    dia_semana: 'LUNES',
    hora_inicio: '',
    hora_fin: '',
    observaciones: '',
  });

  // Form RESERVA
  const [formReserva, setFormReserva] = useState({
    ambiente_id: '',
    instructor_id: '',
    observacion_reserva: '',
    fecha_inicio: '',
    fecha_fin: '',
    dia_semana: 'LUNES',
    hora_inicio: '',
    hora_fin: '',
  });

  // Cargar competencias cuando se selecciona ficha
  useEffect(() => {
    if (formClase.ficha_id) {
      loadCompetencias(formClase.ficha_id);
    } else {
      setCompetencias([]);
      setFormClase(prev => ({ ...prev, competencia_id: '', resultado_id: '' }));
    }
  }, [formClase.ficha_id]);

  // Cargar resultados cuando se selecciona competencia
  useEffect(() => {
    if (formClase.competencia_id) {
      loadResultados(formClase.competencia_id);
    } else {
      setResultados([]);
      setFormClase(prev => ({ ...prev, resultado_id: '' }));
    }
  }, [formClase.competencia_id]);

  const loadCompetencias = async (fichaId: string) => {
    try {
      const { data: fichaData } = await supabase
        .from('fichas')
        .select('programa_id')
        .eq('id', fichaId)
        .single();
      
      if (fichaData) {
        const { data } = await supabase
          .from('competencias')
          .select('id, numero, nombre')
          .eq('programa_id', fichaData.programa_id)
          .eq('is_active', true)
          .order('orden');
        
        setCompetencias(data || []);
      }
    } catch (error) {
      console.error('Error loading competencias:', error);
    }
  };

  const loadResultados = async (competenciaId: string) => {
    try {
      const { data } = await supabase
        .from('resultados_aprendizaje')
        .select('id, nombre')
        .eq('competencia_id', competenciaId)
        .eq('is_active', true)
        .order('orden');
      
      setResultados(data || []);
    } catch (error) {
      console.error('Error loading resultados:', error);
    }
  };

  const handleSubmitClase = async () => {
    if (!formClase.ficha_id || !formClase.competencia_id || !formClase.resultado_id || 
        !formClase.instructor_id || !formClase.ambiente_id || !formClase.fecha_inicio || 
        !formClase.fecha_fin || !formClase.hora_inicio || !formClase.hora_fin) {
      setResult({ success: false, message: 'Por favor completa todos los campos obligatorios' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.rpc('create_horario_clase', {
        p_ficha_id: formClase.ficha_id,
        p_competencia_id: formClase.competencia_id,
        p_resultado_id: formClase.resultado_id,
        p_instructor_id: formClase.instructor_id,
        p_ambiente_id: formClase.ambiente_id,
        p_fecha_inicio: formClase.fecha_inicio,
        p_fecha_fin: formClase.fecha_fin,
        p_dia_semana: formClase.dia_semana,
        p_hora_inicio: formClase.hora_inicio,
        p_hora_fin: formClase.hora_fin,
        p_apoyo: formClase.apoyo || null,
        p_observaciones: formClase.observaciones || null,
      });

      if (error) throw error;

      const response = typeof data === 'string' ? JSON.parse(data) : data;

      if (response.success) {
        setResult({ success: true, message: 'Horario de clase creado exitosamente' });
        onSuccess();
        setTimeout(() => {
          onClose();
          resetForms();
        }, 2000);
      } else {
        throw new Error(response.error);
      }
    } catch (error: any) {
      setResult({ success: false, message: error.message || 'Error al crear horario' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitApoyo = async () => {
    if (!formApoyo.instructor_id || !formApoyo.apoyo_tipo || !formApoyo.fecha_inicio || 
        !formApoyo.fecha_fin || !formApoyo.hora_inicio || !formApoyo.hora_fin) {
      setResult({ success: false, message: 'Por favor completa todos los campos obligatorios' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.rpc('create_horario_apoyo', {
        p_instructor_id: formApoyo.instructor_id,
        p_apoyo_tipo: formApoyo.apoyo_tipo,
        p_fecha_inicio: formApoyo.fecha_inicio,
        p_fecha_fin: formApoyo.fecha_fin,
        p_dia_semana: formApoyo.dia_semana,
        p_hora_inicio: formApoyo.hora_inicio,
        p_hora_fin: formApoyo.hora_fin,
        p_ambiente_id: formApoyo.ambiente_id || null,
        p_observaciones: formApoyo.observaciones || null,
      });

      if (error) throw error;

      const response = typeof data === 'string' ? JSON.parse(data) : data;

      if (response.success) {
        setResult({ success: true, message: 'Horario de apoyo creado exitosamente' });
        onSuccess();
        setTimeout(() => {
          onClose();
          resetForms();
        }, 2000);
      } else {
        throw new Error(response.error);
      }
    } catch (error: any) {
      setResult({ success: false, message: error.message || 'Error al crear horario' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReserva = async () => {
    if (!formReserva.ambiente_id || !formReserva.instructor_id || !formReserva.observacion_reserva ||
        !formReserva.fecha_inicio || !formReserva.fecha_fin || !formReserva.hora_inicio || !formReserva.hora_fin) {
      setResult({ success: false, message: 'Por favor completa todos los campos obligatorios' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.rpc('create_horario_reserva', {
        p_ambiente_id: formReserva.ambiente_id,
        p_instructor_id: formReserva.instructor_id,
        p_observacion_reserva: formReserva.observacion_reserva,
        p_fecha_inicio: formReserva.fecha_inicio,
        p_fecha_fin: formReserva.fecha_fin,
        p_dia_semana: formReserva.dia_semana,
        p_hora_inicio: formReserva.hora_inicio,
        p_hora_fin: formReserva.hora_fin,
      });

      if (error) throw error;

      const response = typeof data === 'string' ? JSON.parse(data) : data;

      if (response.success) {
        setResult({ success: true, message: 'Reserva creada exitosamente' });
        onSuccess();
        setTimeout(() => {
          onClose();
          resetForms();
        }, 2000);
      } else {
        throw new Error(response.error);
      }
    } catch (error: any) {
      setResult({ success: false, message: error.message || 'Error al crear reserva' });
    } finally {
      setLoading(false);
    }
  };

  const resetForms = () => {
    setFormClase({
      ficha_id: '', competencia_id: '', resultado_id: '', instructor_id: '', ambiente_id: '',
      fecha_inicio: '', fecha_fin: '', dia_semana: 'LUNES', hora_inicio: '', hora_fin: '', 
      apoyo: '',
      observaciones: '',
    });
    setFormApoyo({
      instructor_id: '', apoyo_tipo: '', ambiente_id: '', fecha_inicio: '', fecha_fin: '',
      dia_semana: 'LUNES', hora_inicio: '', hora_fin: '', observaciones: '',
    });
    setFormReserva({
      ambiente_id: '', instructor_id: '', observacion_reserva: '', fecha_inicio: '', fecha_fin: '',
      dia_semana: 'LUNES', hora_inicio: '', hora_fin: '',
    });
    setResult(null);
    setCompetencias([]);
    setResultados([]);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Horario</DialogTitle>
          <DialogDescription>
            Selecciona el tipo de horario y completa la información
          </DialogDescription>
        </DialogHeader>

        {result && (
          <Alert variant={result.success ? 'default' : 'destructive'}>
            {result.success ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            <AlertDescription>{result.message}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="clase">
              <BookOpen className="h-4 w-4 mr-2" />
              Clase
            </TabsTrigger>
            <TabsTrigger value="apoyo">
              <Users className="h-4 w-4 mr-2" />
              Apoyo
            </TabsTrigger>
            <TabsTrigger value="reserva">
              <Home className="h-4 w-4 mr-2" />
              Reserva
            </TabsTrigger>
          </TabsList>

          {/* TAB CLASE */}
          <TabsContent value="clase">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ficha <span className="text-red-500">*</span></Label>
                  <Select value={formClase.ficha_id} onValueChange={(v) => setFormClase({...formClase, ficha_id: v})}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    <SelectContent>
                      {fichas.map(f => (
                        <SelectItem key={f.id} value={f.id}>Ficha {f.numero}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Competencia <span className="text-red-500">*</span></Label>
                  <Select 
                    value={formClase.competencia_id} 
                    onValueChange={(v) => setFormClase({...formClase, competencia_id: v})}
                    disabled={!formClase.ficha_id}
                  >
                    <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    <SelectContent>
                      {competencias.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.numero} - {c.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Resultado de Aprendizaje <span className="text-red-500">*</span></Label>
                <Select 
                  value={formClase.resultado_id} 
                  onValueChange={(v) => setFormClase({...formClase, resultado_id: v})}
                  disabled={!formClase.competencia_id}
                >
                  <SelectTrigger><SelectValue placeholder="Seleccionar resultado" /></SelectTrigger>
                  <SelectContent>
                    {resultados.map(r => (
                      <SelectItem key={r.id} value={r.id}>{r.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Apoyo (Materia/Tema)</Label>
                <Input 
                  placeholder="Ej: Desarrollo Web, Bases de Datos, Programación..."
                  value={formClase.apoyo} 
                  onChange={(e) => setFormClase({...formClase, apoyo: e.target.value})} 
                />
                <p className="text-xs text-gray-500">Materia o tema relacionado con el resultado de aprendizaje</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Instructor <span className="text-red-500">*</span></Label>
                  <Select value={formClase.instructor_id} onValueChange={(v) => setFormClase({...formClase, instructor_id: v})}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    <SelectContent>
                      {instructores.map(i => (
                        <SelectItem key={i.id} value={i.id}>{i.nombres}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Ambiente <span className="text-red-500">*</span></Label>
                  <Select value={formClase.ambiente_id} onValueChange={(v) => setFormClase({...formClase, ambiente_id: v})}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    <SelectContent>
                      {ambientes.map(a => (
                        <SelectItem key={a.id} value={a.id}>{a.codigo} - {a.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Día <span className="text-red-500">*</span></Label>
                  <Select value={formClase.dia_semana} onValueChange={(v) => setFormClase({...formClase, dia_semana: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {diasSemana.map(d => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Hora Inicio <span className="text-red-500">*</span></Label>
                  <Input type="time" value={formClase.hora_inicio} onChange={(e) => setFormClase({...formClase, hora_inicio: e.target.value})} />
                </div>

                <div className="space-y-2">
                  <Label>Hora Fin <span className="text-red-500">*</span></Label>
                  <Input type="time" value={formClase.hora_fin} onChange={(e) => setFormClase({...formClase, hora_fin: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fecha Inicio <span className="text-red-500">*</span></Label>
                  <Input type="date" value={formClase.fecha_inicio} onChange={(e) => setFormClase({...formClase, fecha_inicio: e.target.value})} />
                </div>

                <div className="space-y-2">
                  <Label>Fecha Fin <span className="text-red-500">*</span></Label>
                  <Input type="date" value={formClase.fecha_fin} onChange={(e) => setFormClase({...formClase, fecha_fin: e.target.value})} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Observaciones</Label>
                <Textarea value={formClase.observaciones} onChange={(e) => setFormClase({...formClase, observaciones: e.target.value})} rows={2} />
              </div>

              <Button onClick={handleSubmitClase} className="w-full bg-[#39A900] hover:bg-[#2d8000]" disabled={loading}>
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creando...</> : 'Crear Horario de Clase'}
              </Button>
            </div>
          </TabsContent>

          {/* TAB APOYO */}
          <TabsContent value="apoyo">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Instructor <span className="text-red-500">*</span></Label>
                  <Select value={formApoyo.instructor_id} onValueChange={(v) => setFormApoyo({...formApoyo, instructor_id: v})}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    <SelectContent>
                      {instructores.map(i => (
                        <SelectItem key={i.id} value={i.id}>{i.nombres}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tipo de Apoyo <span className="text-red-500">*</span></Label>
                  <Input 
                    placeholder="Ej: Asesoría, Tutoría..."
                    value={formApoyo.apoyo_tipo} 
                    onChange={(e) => setFormApoyo({...formApoyo, apoyo_tipo: e.target.value})} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Ambiente (Opcional)</Label>
                <Select value={formApoyo.ambiente_id} onValueChange={(v) => setFormApoyo({...formApoyo, ambiente_id: v})}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar (opcional)" /></SelectTrigger>
                  <SelectContent>
                    {ambientes.map(a => (
                      <SelectItem key={a.id} value={a.id}>{a.codigo} - {a.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Día <span className="text-red-500">*</span></Label>
                  <Select value={formApoyo.dia_semana} onValueChange={(v) => setFormApoyo({...formApoyo, dia_semana: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {diasSemana.map(d => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Hora Inicio <span className="text-red-500">*</span></Label>
                  <Input type="time" value={formApoyo.hora_inicio} onChange={(e) => setFormApoyo({...formApoyo, hora_inicio: e.target.value})} />
                </div>

                <div className="space-y-2">
                  <Label>Hora Fin <span className="text-red-500">*</span></Label>
                  <Input type="time" value={formApoyo.hora_fin} onChange={(e) => setFormApoyo({...formApoyo, hora_fin: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fecha Inicio <span className="text-red-500">*</span></Label>
                  <Input type="date" value={formApoyo.fecha_inicio} onChange={(e) => setFormApoyo({...formApoyo, fecha_inicio: e.target.value})} />
                </div>

                <div className="space-y-2">
                  <Label>Fecha Fin <span className="text-red-500">*</span></Label>
                  <Input type="date" value={formApoyo.fecha_fin} onChange={(e) => setFormApoyo({...formApoyo, fecha_fin: e.target.value})} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Observaciones</Label>
                <Textarea value={formApoyo.observaciones} onChange={(e) => setFormApoyo({...formApoyo, observaciones: e.target.value})} rows={2} />
              </div>

              <Button onClick={handleSubmitApoyo} className="w-full bg-[#00304D] hover:bg-[#001f33]" disabled={loading}>
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creando...</> : 'Crear Horario de Apoyo'}
              </Button>
            </div>
          </TabsContent>

          {/* TAB RESERVA */}
          <TabsContent value="reserva">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ambiente <span className="text-red-500">*</span></Label>
                  <Select value={formReserva.ambiente_id} onValueChange={(v) => setFormReserva({...formReserva, ambiente_id: v})}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    <SelectContent>
                      {ambientes.map(a => (
                        <SelectItem key={a.id} value={a.id}>{a.codigo} - {a.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Instructor <span className="text-red-500">*</span></Label>
                  <Select value={formReserva.instructor_id} onValueChange={(v) => setFormReserva({...formReserva, instructor_id: v})}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    <SelectContent>
                      {instructores.map(i => (
                        <SelectItem key={i.id} value={i.id}>{i.nombres}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Motivo de Reserva <span className="text-red-500">*</span></Label>
                <Textarea 
                  placeholder="Describe el motivo de la reserva..."
                  value={formReserva.observacion_reserva} 
                  onChange={(e) => setFormReserva({...formReserva, observacion_reserva: e.target.value})} 
                  rows={2} 
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Día <span className="text-red-500">*</span></Label>
                  <Select value={formReserva.dia_semana} onValueChange={(v) => setFormReserva({...formReserva, dia_semana: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {diasSemana.map(d => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Hora Inicio <span className="text-red-500">*</span></Label>
                  <Input type="time" value={formReserva.hora_inicio} onChange={(e) => setFormReserva({...formReserva, hora_inicio: e.target.value})} />
                </div>

                <div className="space-y-2">
                  <Label>Hora Fin <span className="text-red-500">*</span></Label>
                  <Input type="time" value={formReserva.hora_fin} onChange={(e) => setFormReserva({...formReserva, hora_fin: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fecha Inicio <span className="text-red-500">*</span></Label>
                  <Input type="date" value={formReserva.fecha_inicio} onChange={(e) => setFormReserva({...formReserva, fecha_inicio: e.target.value})} />
                </div>

                <div className="space-y-2">
                  <Label>Fecha Fin <span className="text-red-500">*</span></Label>
                  <Input type="date" value={formReserva.fecha_fin} onChange={(e) => setFormReserva({...formReserva, fecha_fin: e.target.value})} />
                </div>
              </div>

              <Button onClick={handleSubmitReserva} className="w-full bg-[#71277A] hover:bg-[#5a1f62]" disabled={loading}>
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creando...</> : 'Crear Reserva de Ambiente'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}