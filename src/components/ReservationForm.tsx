import { useState } from "react";
import Input from "@components/Input.tsx";
import { Calendar } from "@components/Calendar";
import { getAvailableHours } from "@utils/hours";

export function ReservationForm() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState("");
  const [people, setPeople] = useState(2);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<{
    type: "idle" | "loading" | "success" | "error";
    text: string;
  }>({ type: "idle", text: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!time || !name || !phone) return;
    setStatus({ type: "loading", text: "Enviando..." });

    try {
      const res = await fetch("/api/reservations/public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reservation_date: date,
          reservation_time: time,
          party_size: people,
          customer_name: name,
          customer_phone: phone,
          customer_email: email || undefined,
          notes: notes || undefined,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setStatus({
          type: "success",
          text: `Reserva creada — Mesa ${data.table}`,
        });
        setDate(new Date().toISOString().split("T")[0]);
        setTime("");
        setPeople(2);
        setName("");
        setPhone("");
        setEmail("");
        setNotes("");
      } else {
        const msg =
          typeof data.error === "object"
            ? "Revisa los campos del formulario."
            : data.error || "Error al crear la reserva.";
        setStatus({ type: "error", text: msg });
      }
    } catch {
      setStatus({ type: "error", text: "Error de conexión." });
    }
  };

  return (
    <div className="bg-card p-4">
      <h2 className="text-accent-light font-serif text-3xl mb-2">
        Detalles de la Reserva
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-1">
        <Calendar value={date} onChange={setDate} />
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex flex-col gap-2 py-4 w-full">
            <label htmlFor="public-time" className="text-primary font-bold">
              Hora
            </label>
            <select
              id="public-time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              className="bg-elevated border border-muted/40 rounded-sm p-2 outline-none transition-colors scheme-dark text-primary focus:border-primary/80"
            >
              <option value="" disabled>
                Selecciona una hora
              </option>
              {getAvailableHours(date).map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>
          <Input
            id="public-people"
            labelText="Comensales"
            type="number"
            min={1}
            value={people.toString()}
            onChange={(e) => setPeople(Number(e.target.value))}
            required
          />
        </div>
        <Input
          id="public-name"
          labelText="Nombre Completo"
          type="text"
          placeholder="Tu nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          id="public-phone"
          labelText="Teléfono"
          type="tel"
          placeholder="+34 XXX XXX XXX"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        <Input
          id="public-email"
          labelText="Email"
          type="email"
          placeholder="correo@ejemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="flex flex-col gap-1 py-2 w-full">
          <label htmlFor="public-notes" className="text-primary font-bold text-sm">
            Notas
          </label>
          <textarea
            id="public-notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="text-primary bg-elevated border border-muted/40 rounded-sm p-2 outline-none focus:border-primary/80 transition-colors scheme-dark text-sm"
            placeholder="Alergias, ocasión especial..."
          />
        </div>
        <button
          type="submit"
          disabled={status.type === "loading"}
          className="text-primary font-bold bg-transparent border border-brand-red hover:bg-brand-red disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-300 rounded-sm p-4 w-full mt-2"
        >
          {status.type === "loading" ? "ENVIANDO..." : "CONFIRMAR RESERVA"}
        </button>
        {status.type === "success" && (
          <p className="text-green-400 text-xs text-center font-bold mt-2">
            {status.text}
          </p>
        )}
        {status.type === "error" && (
          <p className="text-brand-red text-xs text-center font-bold mt-2">
            {status.text}
          </p>
        )}
      </form>
    </div>
  );
}
