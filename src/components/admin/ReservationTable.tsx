import type { Reservation } from "./types";
import { StatusBadge } from "./StatusBadge";

interface Props {
  reservations: Reservation[];
  onCancel: (id: number) => void;
  onEdit: (r: Reservation) => void;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function ReservationTable({ reservations, onCancel, onEdit }: Props) {
  return (
    <div className="hidden md:block overflow-x-auto">
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
              <td className="p-3 text-sm">{formatDate(r.reservation_date)}</td>
              <td className="p-3 font-mono">{r.reservation_time}</td>
              <td className="p-3 font-medium">{r.customer_name}</td>
              <td className="p-3 hidden sm:table-cell">{r.customer_phone ?? "—"}</td>
              <td className="p-3">{r.party_size}</td>
              <td className="p-3">{r.table_number}</td>
              <td className="p-3"><StatusBadge status={r.status} /></td>
              <td className="p-3">
                <div className="flex gap-2">
                  <button type="button" onClick={() => onEdit(r)} className="text-xs text-accent-light hover:text-accent border border-accent-light/40 hover:border-accent px-2 py-1 rounded-sm transition-colors cursor-pointer">Editar</button>
                  {(r.status === "pending" || r.status === "confirmed") && (
                    <button
                      type="button"
                      onClick={() => onCancel(r.id)}
                      className="text-xs text-brand-red hover:text-white border border-brand-red hover:bg-brand-red px-2 py-1 rounded-sm transition-colors cursor-pointer"
                    >
                      Anular
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
