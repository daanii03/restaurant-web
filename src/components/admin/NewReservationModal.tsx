import { useState, useEffect } from "react";
import Input from "@components/Input";
import { Calendar } from "@components/Calendar";
import { getAvailableHours } from "@utils/hours";
import type { Reservation } from "./types";

interface FormData {
  reservation_date: string;
  reservation_time: string;
  party_size: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (reservation: Reservation) => void;
  onFeedback: (text: string, type: "success" | "error") => void;
}

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function validate(data: FormData): Partial<Record<keyof FormData, string>> {
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
}

export function NewReservationModal({ open, onClose, onCreated, onFeedback }: Props) {
  const [form, setForm] = useState<FormData>({
    reservation_date: todayStr(),
    reservation_time: "",
    party_size: 2,
    customer_name: "",
    customer_phone: "",
    customer_email: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({
        reservation_date: todayStr(),
        reservation_time: "",
        party_size: 2,
        customer_name: "",
        customer_phone: "",
        customer_email: "",
      });
      setErrors({});
    }
  }, [open]);

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
        onClose();
        setErrors({});
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
        onCreated(newReservation);
        onFeedback(`Reserva creada — Mesa ${data.table}`, "success");
      } else {
        const msg = typeof data.error === "object" ? "Revisa los campos del formulario." : data.error;
        onFeedback(msg, "error");
      }
    } catch {
      onFeedback("Error de conexión.", "error");
    }
    setLoading(false);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-40 flex items-start sm:items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-card w-full max-w-lg rounded-sm border border-muted/20 p-4 z-50 my-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-accent font-serif text-xl">Nueva Reserva</h2>
          <button
            onClick={onClose}
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
  );
}
