import { useState, useEffect } from "react";
import Input from "@components/Input";
import { Calendar } from "@components/Calendar";
import { getAvailableHours } from "@utils/hours";

interface Reservation {
  id: number;
  table_id: number;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  party_size: number;
  reservation_date: string;
  reservation_time: string;
  status: string;
  created_at: string;
  table_number: number;
  capacity: number;
}

interface Stats {
  totalToday: number;
  freeTables: number;
  totalPeople: number;
}

interface FormData {
  reservation_date: string;
  reservation_time: string;
  party_size: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
}

type Feedback = { type: "success" | "error"; text: string } | null;

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function calculateStats(reservations: Reservation[]): Stats {
  const today = todayStr();
  const todayActive = reservations.filter(
    (r) => r.reservation_date === today && r.status !== "cancelled"
  );
  const totalToday = todayActive.length;
  const totalPeople = todayActive.reduce((sum, r) => sum + r.party_size, 0);
  const reservedTableIds = todayActive
    .filter((r) => r.status === "pending" || r.status === "confirmed")
    .map((r) => r.table_id);
  const freeTables = 15 - new Set(reservedTableIds).size;
  return { totalToday, freeTables, totalPeople };
}

export function AdminReservationPanel() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalToday: 0,
    freeTables: 15,
    totalPeople: 0,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [form, setForm] = useState<FormData>({
    reservation_date: todayStr(),
    reservation_time: "",
    party_size: 2,
    customer_name: "",
    customer_phone: "",
    customer_email: "",
  });

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/reservations?t=${Date.now()}`);
      if (!res.ok) return;
      const data = await res.json();
      setReservations(data.reservations);
      setStats(data.stats);
    } catch (err) {
      console.error("Error fetching reservations:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") fetchData();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  useEffect(() => {
    const btn = document.getElementById("open-reservation-btn");
    if (!btn) return;
    const handler = () => setModalOpen(true);
    btn.addEventListener("click", handler);
    return () => btn.removeEventListener("click", handler);
  }, []);

  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(null), 4000);
    return () => clearTimeout(t);
  }, [feedback]);

  const validate = (data: FormData): Partial<Record<keyof FormData, string>> => {
    const errs: Partial<Record<keyof FormData, string>> = {};
    if (!data.customer_name.trim()) errs.customer_name = "El nombre es obligatorio.";
    if (!data.reservation_time) errs.reservation_time = "Selecciona una hora.";
    if (data.customer_phone && !/^(\+34)?[679]\d{8}$/.test(data.customer_phone)) {
      errs.customer_phone = "Formato: +34XXXXXXXXX";
    }
    if (data.customer_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.customer_email)) {
      errs.customer_email = "Email inválido.";
    }
    if (data.party_size < 1) errs.party_size = "Debe ser mayor que 0.";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setModalOpen(false);
        setErrors({});
        setForm({
          reservation_date: todayStr(),
          reservation_time: "",
          party_size: 2,
          customer_name: "",
          customer_phone: "",
          customer_email: "",
        });
        const newReservation: Reservation = {
          id: data.id,
          table_id: 0,
          customer_name: form.customer_name,
          customer_phone: form.customer_phone || null,
          customer_email: form.customer_email || null,
          party_size: form.party_size,
          reservation_date: form.reservation_date,
          reservation_time: form.reservation_time,
          status: "confirmed",
          created_at: new Date().toISOString(),
          table_number: data.table,
          capacity: 0,
        };
        const updated = [newReservation, ...reservations];
        setReservations(updated);
        setStats(calculateStats(updated));
        setFeedback({ type: "success", text: `Reserva creada — Mesa ${data.table}` });
        fetchData();
      } else {
        const msg = typeof data.error === "object" ? "Revisa los campos del formulario." : data.error;
        setFeedback({ type: "error", text: msg });
      }
    } catch {
      setFeedback({ type: "error", text: "Error de conexión." });
    }
    setLoading(false);
  };

  const handleCancel = async (id: number) => {
    const updated = reservations.map((r) =>
      r.id === id ? { ...r, status: "cancelled" } : r
    );
    setReservations(updated);
    setStats(calculateStats(updated));
    setFeedback({ type: "success", text: "Reserva cancelada" });
    try {
      const res = await fetch("/api/reservations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "cancelled" }),
      });
      if (!res.ok) {
        setFeedback({ type: "error", text: "Error al cancelar." });
        fetchData();
      }
    } catch {
      setFeedback({ type: "error", text: "Error de conexión." });
      fetchData();
    }
  };

  const update = (field: keyof FormData, value: string | number) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "reservation_date") {
        const hours = getAvailableHours(value as string);
        if (next.reservation_time && !hours.includes(next.reservation_time)) {
          next.reservation_time = "";
        }
      }
      return next;
    });
  };

  const todayOccupied = 15 - stats.freeTables;

  const statsCards = [
    {
      title: "Reservas Hoy",
      value: stats.totalToday,
      color: "text-accent",
      colorIcon: "text-accent/60",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24"><path d="M11.5 21H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6M16 3v4M8 3v4m-4 4h16m-5 8 2 2 4-4" /></svg>
      ),
      footer: <p>{todayOccupied} {todayOccupied === 1 ? "mesa ocupada" : "mesas ocupadas"}</p>,
    },
    {
      title: "Mesas libres",
      value: stats.freeTables,
      color: "text-primary",
      colorIcon: "text-primary/60",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18M4 6v13m16 0V6M4 10h16m-5-4v8a2 2 0 0 0 2 2h3" /></svg>
      ),
      footer: (
        <div className="w-full bg-muted/30 rounded-full h-1.5 mt-2">
          <div className="bg-primary h-1.5 rounded-full" style={{ width: `${(stats.freeTables / 15) * 100}%` }} />
        </div>
      ),
    },
    {
      title: "Total Comensales",
      value: stats.totalPeople,
      color: "text-brand-red-light",
      colorIcon: "text-brand-red-light/60",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 7a4 4 0 1 0 8 0 4 4 0 1 0-8 0M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2m1-17.87a4 4 0 0 1 0 7.75M21 21v-2a4 4 0 0 0-3-3.85" /></svg>
      ),
      footer: <p className="italic">Repartidos en {todayOccupied} {todayOccupied === 1 ? "mesa" : "mesas"}</p>,
    },
  ];

  return (
    <>
      {feedback && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-sm border font-bold text-sm transition-all ${
            feedback.type === "success"
              ? "bg-green-900/40 text-green-400 border-green-500/50"
              : "bg-red-900/40 text-brand-red border-brand-red/50"
          }`}
        >
          {feedback.text}
        </div>
      )}

      <section className="mt-8 flex flex-col">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 justify-center items-center px-4 gap-4">
          {statsCards.map((card) => (
            <div key={card.title} className="bg-card flex flex-col p-4 h-full">
              <div className="flex flex-row justify-between items-center w-full rounded-sm">
                <h2 className="text-xl text-primary">{card.title}</h2>
                <div className={`${card.colorIcon} flex items-center justify-center`}>
                  {card.icon}
                </div>
              </div>
              <p className={`${card.color} text-4xl font-serif`}>
                {String(card.value).padStart(2, "0")}
              </p>
              <div className="mt-auto text-sm text-primary">
                {card.footer}
              </div>
            </div>
          ))}
        </div>

        <div className="px-4 mt-8">
          <h2 className="text-primary font-serif text-2xl mb-4">Próximas Reservas</h2>
          {reservations.length === 0 ? (
            <p className="text-primary/60 italic">No hay próximas reservas.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-primary">
                <thead>
                  <tr className="border-b border-muted/20 text-sm uppercase tracking-wider text-primary/60">
                    <th className="p-3">Día</th>
                    <th className="p-3">Hora</th>
                    <th className="p-3">Nombre</th>
                    <th className="p-3 hidden sm:table-cell">Teléfono</th>
                    <th className="p-3">Comensales</th>
                    <th className="p-3">Mesa</th>
                    <th className="p-3">Estado</th>
                    <th className="p-3">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((r) => (
                    <tr key={r.id} className="border-b border-muted/10 hover:bg-muted/10 transition-colors">
                      <td className="p-3 text-sm">{new Date(r.reservation_date + "T12:00:00").toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" })}</td>
                      <td className="p-3 font-mono">{r.reservation_time}</td>
                      <td className="p-3 font-medium">{r.customer_name}</td>
                      <td className="p-3 hidden sm:table-cell">{r.customer_phone ?? "—"}</td>
                      <td className="p-3">{r.party_size}</td>
                      <td className="p-3">{r.table_number}</td>
                      <td className="p-3">
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded-sm ${
                            r.status === "confirmed"
                              ? "bg-green-900/40 text-green-400"
                              : r.status === "pending"
                                ? "bg-yellow-900/40 text-yellow-400"
                                : r.status === "cancelled"
                                  ? "bg-red-900/40 text-brand-red"
                                  : "bg-blue-900/40 text-blue-400"
                          }`}
                        >
                          {r.status === "confirmed"
                            ? "Confirmada"
                            : r.status === "pending"
                              ? "Pendiente"
                              : r.status === "cancelled"
                                ? "Cancelada"
                                : "Completada"}
                        </span>
                      </td>
                      <td className="p-3">
                        {(r.status === "pending" || r.status === "confirmed") && (
                          <button
                            type="button"
                            onClick={() => handleCancel(r.id)}
                            className="text-xs text-brand-red hover:text-white border border-brand-red hover:bg-brand-red px-2 py-1 rounded-sm transition-colors cursor-pointer"
                          >
                            Anular
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 flex items-start sm:items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}
        >
          <div className="bg-card w-full max-w-lg rounded-sm border border-muted/20 p-4 z-50 my-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-accent font-serif text-xl">Nueva Reserva</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-primary hover:text-accent-light transition-colors cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-1">
              <Calendar
                value={form.reservation_date}
                onChange={(date) => update("reservation_date", date)}
              />
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex flex-col gap-2 py-4 w-full">
                  <label htmlFor="reservation_time" className="text-primary font-bold">
                    Hora
                  </label>
                  <select
                    id="reservation_time"
                    value={form.reservation_time}
                    onChange={(e) => update("reservation_time", e.target.value)}
                    required
                    className={`bg-elevated border rounded-sm p-2 outline-none transition-colors scheme-dark ${
                      errors.reservation_time
                        ? "border-brand-red text-brand-red focus:border-brand-red"
                        : "border-muted/40 text-primary focus:border-primary/80"
                    }`}
                  >
                    <option value="" disabled>Selecciona una hora</option>
                    {getAvailableHours(form.reservation_date).map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                  {errors.reservation_time && <p className="text-brand-red text-xs">{errors.reservation_time}</p>}
                </div>
                <Input
                  id="party_size"
                  labelText="Comensales"
                  type="number"
                  min={1}
                  value={form.party_size.toString()}
                  onChange={(e) => update("party_size", Number(e.target.value))}
                  required
                  error={errors.party_size}
                />
              </div>
              <Input
                id="customer_name"
                labelText="Nombre Completo"
                type="text"
                placeholder="Nombre del cliente"
                value={form.customer_name}
                onChange={(e) => update("customer_name", e.target.value)}
                required
                error={errors.customer_name}
              />
              <Input
                id="customer_phone"
                labelText="Teléfono"
                type="tel"
                placeholder="+34 XXX XXX XXX"
                value={form.customer_phone}
                onChange={(e) => update("customer_phone", e.target.value)}
                error={errors.customer_phone}
              />
              <Input
                id="customer_email"
                labelText="Email"
                type="email"
                placeholder="cliente@ejemplo.com"
                value={form.customer_email}
                onChange={(e) => update("customer_email", e.target.value)}
                error={errors.customer_email}
              />
              <button
                type="submit"
                disabled={loading}
                className="text-primary font-bold bg-transparent border border-brand-red hover:bg-brand-red disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-300 rounded-sm p-3 w-full text-sm"
              >
                {loading ? "CREANDO RESERVA..." : "CONFIRMAR RESERVA"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
