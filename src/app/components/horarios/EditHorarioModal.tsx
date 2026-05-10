import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "../ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "../ui/alert-dialog";
import { Button }   from "../ui/button";
import { Input }    from "../ui/input";
import { Label }    from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Alert, AlertDescription } from "../ui/alert";
import { Badge }    from "../ui/badge";
import { Loader2, CheckCircle, XCircle, Trash2, BookOpen, Users, Home } from "lucide-react";

// ─────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────
interface EditHorarioModalProps {
  open:      boolean;
  onClose:   () => void;
  onSuccess: () => void;
  horario:   any | null;   // solo necesita .id y .tipo para abrir
  userRole?: string;       // "admin" | "coordinador" | ...
}

// ─────────────────────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────────────────────
const DIAS = ["LUNES","MARTES","MIERCOLES","JUEVES","VIERNES","SABADO"];

const TIPO_COLOR: Record<string, string> = {
  CLASE:   "#39A900",
  APOYO:   "#00304D",
  RESERVA: "#71277A",
};

// ─────────────────────────────────────────────────────────────
// Helpers UI
// ─────────────────────────────────────────────────────────────
const Req = () => <span className="text-red-500 ml-0.5">*</span>;

function SecTitle({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider
                  flex items-center gap-1.5 pt-2 pb-1 border-b border-gray-100">
      <Icon className="h-3.5 w-3.5" />{label}
    </p>
  );
}

// ─────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────
export function EditHorarioModal({
  open, onClose, onSuccess, horario, userRole,
}: EditHorarioModalProps) {

  // El rol se obtiene internamente — no depende de la prop
  const [currentRole, setCurrentRole] = useState<string>("");
  const isAdmin       = currentRole === "admin";
  const canDelete     = currentRole === "admin"; // solo admin puede borrar permanentemente

  // ── Estado general ────────────────────────────────────────
  const [loading,  setLoading]  = useState(false);
  const [fetching, setFetching] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [result,   setResult]   = useState<{success:boolean;message:string}|null>(null);
  const [showDel,  setShowDel]  = useState(false);
  const [fullData, setFullData] = useState<any>(null);

  // ── Listas (se cargan al abrir el modal) ──────────────────
  const [fichas,       setFichas]       = useState<any[]>([]);
  const [instructores, setInstructores] = useState<any[]>([]);
  const [ambientes,    setAmbientes]    = useState<any[]>([]);
  const [competencias, setCompetencias] = useState<any[]>([]);
  const [resultados,   setResultados]   = useState<any[]>([]);

  // ── Formularios por tipo ──────────────────────────────────
  const [cF, setCF] = useState({
    ficha_id:"", competencia_id:"", resultado_id:"",
    instructor_id:"", ambiente_id:"", apoyo:"",
    dia_semana:"LUNES", hora_inicio:"", hora_fin:"",
    fecha_inicio:"", fecha_fin:"", observaciones:"",
  });

  const [aF, setAF] = useState({
    instructor_id:"", apoyo_tipo:"", ambiente_id:"",
    clear_ambiente: false,
    dia_semana:"LUNES", hora_inicio:"", hora_fin:"",
    fecha_inicio:"", fecha_fin:"", observaciones:"",
  });

  const [rF, setRF] = useState({
    ambiente_id:"", instructor_id:"", observacion_reserva:"",
    dia_semana:"LUNES", hora_inicio:"", hora_fin:"",
    fecha_inicio:"", fecha_fin:"",
  });

  // ─────────────────────────────────────────────────────────
  // Al abrir: cargar horario completo + listas en paralelo
  // ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open || !horario?.id) return;

    setResult(null);
    setFullData(null);
    setCompetencias([]);
    setResultados([]);
    setFetching(true);

    const run = async () => {
      try {
        // Rol del usuario actual (interno, sin depender de props del padre)
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("profiles").select("rol").eq("id", user.id).single();
          if (profile?.rol) setCurrentRole(profile.rol);
        }

        // Datos completos del horario desde la vista que tiene TODOS los IDs
        const { data: hData, error: hErr } = await supabase
          .from("horarios_stats")
          .select("*")
          .eq("id", horario.id)
          .single();

        if (hErr || !hData) throw hErr || new Error("No se encontró el horario");

        // Listas de selects
        const [fichasRes, instRes, ambRes] = await Promise.all([
          supabase.from("fichas")
            .select("id, numero, programa_id")
            .eq("is_active", true).order("numero"),
          supabase.from("profiles")
            .select("id, nombres")
            .eq("rol", "instructor").eq("is_active", true).order("nombres"),
          supabase.from("ambientes")
            .select("id, codigo, nombre")
            .eq("is_active", true).order("codigo"),
        ]);

        setFichas(fichasRes.data    || []);
        setInstructores(instRes.data || []);
        setAmbientes(ambRes.data    || []);
        setFullData(hData);

        // Hora normalizada HH:MM (la BD devuelve HH:MM:SS)
        const hi = (hData.hora_inicio || "").substring(0, 5);
        const hf = (hData.hora_fin    || "").substring(0, 5);

        // Poblar formulario según tipo
        if (hData.tipo === "CLASE") {
          setCF({
            ficha_id:       hData.ficha_id       || "",
            competencia_id: hData.competencia_id || "",
            resultado_id:   hData.resultado_id   || "",
            instructor_id:  hData.instructor_id  || "",
            ambiente_id:    hData.ambiente_id    || "",
            apoyo:          hData.apoyo          || "",
            dia_semana:     hData.dia_semana      || "LUNES",
            hora_inicio:    hi,
            hora_fin:       hf,
            fecha_inicio:   hData.fecha_inicio   || "",
            fecha_fin:      hData.fecha_fin      || "",
            observaciones:  hData.observaciones  || "",
          });

          // Cargar competencias de la ficha actual
          if (hData.ficha_id) {
            const { data: fichaInfo } = await supabase
              .from("fichas").select("programa_id")
              .eq("id", hData.ficha_id).single();

            if (fichaInfo) {
              const { data: comps } = await supabase
                .from("competencias").select("id, numero, nombre")
                .eq("programa_id", fichaInfo.programa_id)
                .eq("is_active", true).order("orden");
              setCompetencias(comps || []);
            }
          }

          // Cargar resultados de la competencia actual
          if (hData.competencia_id) {
            const { data: ress } = await supabase
              .from("resultados_aprendizaje").select("id, nombre")
              .eq("competencia_id", hData.competencia_id)
              .eq("is_active", true).order("orden");
            setResultados(ress || []);
          }
        }

        if (hData.tipo === "APOYO") {
          setAF({
            instructor_id:  hData.instructor_id || "",
            apoyo_tipo:     hData.apoyo_tipo    || "",
            ambiente_id:    hData.ambiente_id   || "",
            clear_ambiente: false,
            dia_semana:     hData.dia_semana     || "LUNES",
            hora_inicio:    hi,
            hora_fin:       hf,
            fecha_inicio:   hData.fecha_inicio  || "",
            fecha_fin:      hData.fecha_fin     || "",
            observaciones:  hData.observaciones || "",
          });
        }

        if (hData.tipo === "RESERVA") {
          setRF({
            ambiente_id:         hData.ambiente_id         || "",
            instructor_id:       hData.instructor_id       || "",
            observacion_reserva: hData.observacion_reserva || "",
            dia_semana:          hData.dia_semana           || "LUNES",
            hora_inicio:         hi,
            hora_fin:            hf,
            fecha_inicio:        hData.fecha_inicio        || "",
            fecha_fin:           hData.fecha_fin           || "",
          });
        }

      } catch (e: any) {
        setResult({ success: false, message: e.message || "Error cargando horario" });
      } finally {
        setFetching(false);
      }
    };

    run();
  }, [open, horario?.id]);

  // ── Cambio de ficha → recargar competencias ───────────────
  const handleFichaChange = async (fichaId: string) => {
    setCF(f => ({ ...f, ficha_id: fichaId, competencia_id: "", resultado_id: "" }));
    setCompetencias([]);
    setResultados([]);
    if (!fichaId) return;

    const { data: fichaInfo } = await supabase
      .from("fichas").select("programa_id").eq("id", fichaId).single();
    if (!fichaInfo) return;

    const { data: comps } = await supabase
      .from("competencias").select("id, numero, nombre")
      .eq("programa_id", fichaInfo.programa_id)
      .eq("is_active", true).order("orden");
    setCompetencias(comps || []);
  };

  // ── Cambio de competencia → recargar resultados ───────────
  const handleCompetenciaChange = async (compId: string) => {
    setCF(f => ({ ...f, competencia_id: compId, resultado_id: "" }));
    setResultados([]);
    if (!compId) return;

    const { data: ress } = await supabase
      .from("resultados_aprendizaje").select("id, nombre")
      .eq("competencia_id", compId).eq("is_active", true).order("orden");
    setResultados(ress || []);
  };

  // ── Submit ────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!fullData) return;
    setLoading(true);
    setResult(null);

    try {
      let fn = "";
      let params: Record<string, any> = { p_horario_id: fullData.id };

      if (fullData.tipo === "CLASE") {
        if (!cF.ficha_id || !cF.competencia_id || !cF.instructor_id ||
            !cF.ambiente_id || !cF.fecha_inicio || !cF.fecha_fin ||
            !cF.hora_inicio || !cF.hora_fin)
          throw new Error("Completa todos los campos obligatorios");

        fn = "update_horario_clase";
        params = { ...params,
          p_ficha_id:       cF.ficha_id,
          p_competencia_id: cF.competencia_id,
          p_resultado_id:   cF.resultado_id  || null,
          p_instructor_id:  cF.instructor_id,
          p_ambiente_id:    cF.ambiente_id,
          p_fecha_inicio:   cF.fecha_inicio,
          p_fecha_fin:      cF.fecha_fin,
          p_dia_semana:     cF.dia_semana,
          p_hora_inicio:    cF.hora_inicio,
          p_hora_fin:       cF.hora_fin,
          p_apoyo:          cF.apoyo         || null,
          p_observaciones:  cF.observaciones || null,
        };
      }

      if (fullData.tipo === "APOYO") {
        if (!aF.instructor_id || !aF.apoyo_tipo ||
            !aF.fecha_inicio  || !aF.fecha_fin  ||
            !aF.hora_inicio   || !aF.hora_fin)
          throw new Error("Completa todos los campos obligatorios");

        fn = "update_horario_apoyo";
        params = { ...params,
          p_instructor_id:  aF.instructor_id,
          p_apoyo_tipo:     aF.apoyo_tipo,
          p_ambiente_id:    aF.clear_ambiente ? null : (aF.ambiente_id || null),
          p_clear_ambiente: aF.clear_ambiente,
          p_fecha_inicio:   aF.fecha_inicio,
          p_fecha_fin:      aF.fecha_fin,
          p_dia_semana:     aF.dia_semana,
          p_hora_inicio:    aF.hora_inicio,
          p_hora_fin:       aF.hora_fin,
          p_observaciones:  aF.observaciones || null,
        };
      }

      if (fullData.tipo === "RESERVA") {
        if (!rF.ambiente_id || !rF.instructor_id ||
            !rF.observacion_reserva || !rF.fecha_inicio ||
            !rF.fecha_fin || !rF.hora_inicio || !rF.hora_fin)
          throw new Error("Completa todos los campos obligatorios");

        fn = "update_horario_reserva";
        params = { ...params,
          p_ambiente_id:         rF.ambiente_id,
          p_instructor_id:       rF.instructor_id,
          p_observacion_reserva: rF.observacion_reserva,
          p_fecha_inicio:        rF.fecha_inicio,
          p_fecha_fin:           rF.fecha_fin,
          p_dia_semana:          rF.dia_semana,
          p_hora_inicio:         rF.hora_inicio,
          p_hora_fin:            rF.hora_fin,
        };
      }

      const { data, error } = await supabase.rpc(fn, params);
      if (error) throw error;

      const res = typeof data === "string" ? JSON.parse(data) : data;
      if (!res.success) throw new Error(res.error);

      setResult({ success: true, message: res.message || "Horario actualizado exitosamente" });
      onSuccess();
      setTimeout(() => { onClose(); setResult(null); }, 1600);
    } catch (e: any) {
      setResult({ success: false, message: e.message || "Error al actualizar horario" });
    } finally {
      setLoading(false);
    }
  };

  // ── Hard delete ───────────────────────────────────────────
  const handleDelete = async () => {
    if (!fullData) return;
    setDeleting(true);
    try {
      const { data, error } = await supabase.rpc("delete_horario", {
        p_horario_id: fullData.id,
      });
      if (error) throw error;
      const res = typeof data === "string" ? JSON.parse(data) : data;
      if (!res.success) throw new Error(res.error);
      setShowDel(false);
      onSuccess();
      onClose();
    } catch (e: any) {
      setResult({ success: false, message: e.message || "Error al eliminar" });
      setShowDel(false);
    } finally {
      setDeleting(false);
    }
  };

  if (!horario) return null;

  const tipo  = fullData?.tipo || horario?.tipo || "";
  const color = TIPO_COLOR[tipo] || "#555";

  const DiaSelect = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <div className="space-y-2">
      <Label>Día <Req /></Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          {DIAS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );

  // ─────────────────────────────────────────────────────────
  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[92vh] overflow-hidden flex flex-col">

          {/* Header */}
          <DialogHeader className="flex-shrink-0 pb-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <DialogTitle className="text-xl text-[#00304D]">Editar Horario</DialogTitle>
                {tipo && (
                  <Badge style={{ backgroundColor: color }} className="text-white text-xs">
                    {tipo}
                  </Badge>
                )}
              </div>

              {/* Botón eliminar — solo admin, solo cuando los datos cargaron */}
              {canDelete && !fetching && fullData && (
                <Button
                  variant="ghost" size="sm"
                  onClick={() => setShowDel(true)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 gap-1.5"
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar permanentemente
                </Button>
              )}
            </div>
            <DialogDescription>
              Edita cualquier campo del horario. Los conflictos se validan automáticamente.
            </DialogDescription>
          </DialogHeader>

          {/* Alert resultado */}
          {result && (
            <Alert variant={result.success ? "default" : "destructive"}
                   className="flex-shrink-0 mx-1 mt-1">
              {result.success
                ? <CheckCircle className="h-4 w-4" />
                : <XCircle    className="h-4 w-4" />}
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>
          )}

          {/* Spinner mientras carga */}
          {fetching && (
            <div className="flex-1 flex items-center justify-center py-16">
              <div className="text-center space-y-3">
                <Loader2 className="h-9 w-9 animate-spin text-[#39A900] mx-auto" />
                <p className="text-sm text-gray-500">Cargando datos del horario…</p>
              </div>
            </div>
          )}

          {/* Formulario */}
          {!fetching && fullData && (
            <div className="flex-1 overflow-y-auto px-1 py-3 space-y-4">

              {/* ══════════════════ CLASE ══════════════════ */}
              {tipo === "CLASE" && (
                <>
                  <SecTitle icon={BookOpen} label="Datos académicos" />

                  <div className="space-y-2">
                    <Label>Ficha <Req /></Label>
                    <Select value={cF.ficha_id} onValueChange={handleFichaChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar ficha" />
                      </SelectTrigger>
                      <SelectContent>
                        {fichas.map(f => (
                          <SelectItem key={f.id} value={f.id}>Ficha {f.numero}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Competencia <Req /></Label>
                    <Select
                      value={cF.competencia_id}
                      onValueChange={handleCompetenciaChange}
                      disabled={!cF.ficha_id}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={
                          !cF.ficha_id ? "Primero selecciona una ficha"
                          : competencias.length === 0 ? "Cargando…"
                          : "Seleccionar competencia"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {competencias.map(c => (
                          <SelectItem key={c.id} value={c.id}>
                            <span className="block truncate max-w-sm">
                              {c.numero} — {c.nombre}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Resultado de Aprendizaje</Label>
                    <Select
                      value={cF.resultado_id}
                      onValueChange={v => setCF(f => ({ ...f, resultado_id: v }))}
                      disabled={!cF.competencia_id}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar resultado (opcional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {resultados.map(r => (
                          <SelectItem key={r.id} value={r.id}>
                            <span className="block truncate max-w-sm">{r.nombre}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Apoyo / Tema</Label>
                    <Input
                      placeholder="Ej: Desarrollo Web, Bases de Datos…"
                      value={cF.apoyo}
                      onChange={e => setCF(f => ({ ...f, apoyo: e.target.value }))}
                    />
                  </div>

                  <SecTitle icon={Users} label="Instructor y ambiente" />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Instructor <Req /></Label>
                      <Select
                        value={cF.instructor_id}
                        onValueChange={v => setCF(f => ({ ...f, instructor_id: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar instructor" />
                        </SelectTrigger>
                        <SelectContent>
                          {instructores.map(i => (
                            <SelectItem key={i.id} value={i.id}>{i.nombres}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Ambiente <Req /></Label>
                      <Select
                        value={cF.ambiente_id}
                        onValueChange={v => setCF(f => ({ ...f, ambiente_id: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar ambiente" />
                        </SelectTrigger>
                        <SelectContent>
                          {ambientes.map(a => (
                            <SelectItem key={a.id} value={a.id}>
                              {a.codigo} — {a.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <SecTitle icon={BookOpen} label="Día, horas y vigencia" />

                  <div className="grid grid-cols-3 gap-4">
                    <DiaSelect
                      value={cF.dia_semana}
                      onChange={v => setCF(f => ({ ...f, dia_semana: v }))}
                    />
                    <div className="space-y-2">
                      <Label>Hora inicio <Req /></Label>
                      <Input type="time" value={cF.hora_inicio}
                        onChange={e => setCF(f => ({ ...f, hora_inicio: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Hora fin <Req /></Label>
                      <Input type="time" value={cF.hora_fin}
                        onChange={e => setCF(f => ({ ...f, hora_fin: e.target.value }))} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Fecha inicio <Req /></Label>
                      <Input type="date" value={cF.fecha_inicio}
                        onChange={e => setCF(f => ({ ...f, fecha_inicio: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Fecha fin <Req /></Label>
                      <Input type="date" value={cF.fecha_fin}
                        onChange={e => setCF(f => ({ ...f, fecha_fin: e.target.value }))} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Observaciones</Label>
                    <Textarea rows={2} placeholder="Observaciones adicionales…"
                      value={cF.observaciones}
                      onChange={e => setCF(f => ({ ...f, observaciones: e.target.value }))} />
                  </div>
                </>
              )}

              {/* ══════════════════ APOYO ══════════════════ */}
              {tipo === "APOYO" && (
                <>
                  <SecTitle icon={Users} label="Instructor y tipo de apoyo" />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Instructor <Req /></Label>
                      <Select
                        value={aF.instructor_id}
                        onValueChange={v => setAF(f => ({ ...f, instructor_id: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar instructor" />
                        </SelectTrigger>
                        <SelectContent>
                          {instructores.map(i => (
                            <SelectItem key={i.id} value={i.id}>{i.nombres}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Tipo de Apoyo <Req /></Label>
                      <Input
                        placeholder="Ej: Tutoría, Asesoría, Bienestar…"
                        value={aF.apoyo_tipo}
                        onChange={e => setAF(f => ({ ...f, apoyo_tipo: e.target.value }))}
                      />
                    </div>
                  </div>

                  <SecTitle icon={Home} label="Ambiente (opcional)" />

                  <div className="space-y-2">
                    <Label>Ambiente</Label>
                    <Select
                      value={aF.clear_ambiente ? "__none__" : (aF.ambiente_id || "__none__")}
                      onValueChange={v => {
                        if (v === "__none__") {
                          setAF(f => ({ ...f, ambiente_id: "", clear_ambiente: true }));
                        } else {
                          setAF(f => ({ ...f, ambiente_id: v, clear_ambiente: false }));
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sin ambiente (opcional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">— Sin ambiente —</SelectItem>
                        {ambientes.map(a => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.codigo} — {a.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <SecTitle icon={BookOpen} label="Día, horas y vigencia" />

                  <div className="grid grid-cols-3 gap-4">
                    <DiaSelect
                      value={aF.dia_semana}
                      onChange={v => setAF(f => ({ ...f, dia_semana: v }))}
                    />
                    <div className="space-y-2">
                      <Label>Hora inicio <Req /></Label>
                      <Input type="time" value={aF.hora_inicio}
                        onChange={e => setAF(f => ({ ...f, hora_inicio: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Hora fin <Req /></Label>
                      <Input type="time" value={aF.hora_fin}
                        onChange={e => setAF(f => ({ ...f, hora_fin: e.target.value }))} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Fecha inicio <Req /></Label>
                      <Input type="date" value={aF.fecha_inicio}
                        onChange={e => setAF(f => ({ ...f, fecha_inicio: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Fecha fin <Req /></Label>
                      <Input type="date" value={aF.fecha_fin}
                        onChange={e => setAF(f => ({ ...f, fecha_fin: e.target.value }))} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Observaciones</Label>
                    <Textarea rows={2} placeholder="Observaciones adicionales…"
                      value={aF.observaciones}
                      onChange={e => setAF(f => ({ ...f, observaciones: e.target.value }))} />
                  </div>
                </>
              )}

              {/* ══════════════════ RESERVA ════════════════ */}
              {tipo === "RESERVA" && (
                <>
                  <SecTitle icon={Home} label="Ambiente e instructor" />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Ambiente <Req /></Label>
                      <Select
                        value={rF.ambiente_id}
                        onValueChange={v => setRF(f => ({ ...f, ambiente_id: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar ambiente" />
                        </SelectTrigger>
                        <SelectContent>
                          {ambientes.map(a => (
                            <SelectItem key={a.id} value={a.id}>
                              {a.codigo} — {a.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Instructor <Req /></Label>
                      <Select
                        value={rF.instructor_id}
                        onValueChange={v => setRF(f => ({ ...f, instructor_id: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar instructor" />
                        </SelectTrigger>
                        <SelectContent>
                          {instructores.map(i => (
                            <SelectItem key={i.id} value={i.id}>{i.nombres}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Motivo de Reserva <Req /></Label>
                    <Textarea rows={3}
                      placeholder="Describe el motivo de la reserva…"
                      value={rF.observacion_reserva}
                      onChange={e => setRF(f => ({ ...f, observacion_reserva: e.target.value }))} />
                  </div>

                  <SecTitle icon={BookOpen} label="Día, horas y vigencia" />

                  <div className="grid grid-cols-3 gap-4">
                    <DiaSelect
                      value={rF.dia_semana}
                      onChange={v => setRF(f => ({ ...f, dia_semana: v }))}
                    />
                    <div className="space-y-2">
                      <Label>Hora inicio <Req /></Label>
                      <Input type="time" value={rF.hora_inicio}
                        onChange={e => setRF(f => ({ ...f, hora_inicio: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Hora fin <Req /></Label>
                      <Input type="time" value={rF.hora_fin}
                        onChange={e => setRF(f => ({ ...f, hora_fin: e.target.value }))} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Fecha inicio <Req /></Label>
                      <Input type="date" value={rF.fecha_inicio}
                        onChange={e => setRF(f => ({ ...f, fecha_inicio: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Fecha fin <Req /></Label>
                      <Input type="date" value={rF.fecha_fin}
                        onChange={e => setRF(f => ({ ...f, fecha_fin: e.target.value }))} />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Footer */}
          <DialogFooter className="flex-shrink-0 border-t pt-4 gap-2">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || fetching || !fullData}
              style={{ backgroundColor: color }}
              className="text-white hover:opacity-90 min-w-[140px]"
            >
              {loading
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando…</>
                : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm hard delete */}
      <AlertDialog open={showDel} onOpenChange={setShowDel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Eliminar horario permanentemente
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción <strong>no se puede deshacer</strong>. El horario desaparecerá
              de la base de datos para siempre.
              <br /><br />
              <span className="font-medium text-gray-700">
                {tipo} — {fullData?.dia_semana}{" "}
                {fullData?.hora_inicio?.substring(0, 5)}–
                {fullData?.hora_fin?.substring(0, 5)}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : "Sí, eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}