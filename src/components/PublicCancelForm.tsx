import { useState } from "react";

export function PublicCancelForm() {
  const [id, setId] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<{
    type: "idle" | "loading" | "success" | "error";
    text: string;
  }>({ type: "idle", text: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !phone) return;
    setStatus({ type: "loading", text: "Cancelando..." });

    try {
      const res = await fetch("/api/reservations/public-cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: Number(id), customer_phone: phone }),
      });
      const data = await res.json();

      if (res.ok) {
        setStatus({ type: "success", text: "Reserva cancelada con éxito." });
      } else {
        setStatus({ type: "error", text: data.error || "Error al cancelar." });
      }
    } catch {
      setStatus({ type: "error", text: "Error de conexión." });
    }
  };

  return (
    <div className="bg-card p-4">
      <h3 className="text-accent-light flex flex-row gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0m6-2 2 2 4-4" /></svg>
        Cancelar Reserva
      </h3>
      <p className="text-wrap text-primary py-4 text-sm">
        Si necesitas cancelar tu reserva, introduce tu número de reserva y teléfono.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <input
          type="number"
          placeholder="Nº de reserva"
          value={id}
          onChange={(e) => setId(e.target.value)}
          className="text-primary bg-elevated border border-muted/40 rounded-sm p-2 outline-none focus:border-primary/80 transition-colors scheme-dark w-full"
          required
        />
        <input
          type="tel"
          placeholder="Teléfono"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="text-primary bg-elevated border border-muted/40 rounded-sm p-2 outline-none focus:border-primary/80 transition-colors scheme-dark w-full"
          required
        />
        <button
          type="submit"
          disabled={status.type === "loading"}
          className="text-primary font-bold bg-transparent border border-brand-red hover:bg-brand-red disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-300 rounded-sm p-2 w-full text-sm"
        >
          {status.type === "loading" ? "CANCELANDO..." : "CANCELAR RESERVA"}
        </button>
        {status.type === "success" && (
          <p className="text-green-400 text-xs text-center font-bold">{status.text}</p>
        )}
        {status.type === "error" && (
          <p className="text-brand-red text-xs text-center font-bold">{status.text}</p>
        )}
      </form>
    </div>
  );
}
