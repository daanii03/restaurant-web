import type { Reservation } from "./types";
import { StatusBadge } from "./StatusBadge";

interface Props {
  reservations: Reservation[];
  onCancel: (id: number) => void;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function ReservationMobileCards({ reservations, onCancel }: Props) {
  return (
    <div className="block md:hidden space-y-3">
      {reservations.map((r) => (
        <div key={r.id} className="bg-card border border-muted/20 rounded-sm p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-primary font-medium text-base leading-tight">{r.customer_name}</p>
              <p className="text-primary/60 text-xs mt-0.5">
                {formatDate(r.reservation_date)}
                {" · "}
                <span className="font-mono">{r.reservation_time}</span>
              </p>
            </div>
            <StatusBadge status={r.status} />
          </div>
          <div className="flex items-center gap-4 text-sm text-primary/80">
            <span>👥 {r.party_size} {r.party_size === 1 ? "comensal" : "comensales"}</span>
            <span>🪑 Mesa {r.table_number}</span>
            {r.customer_phone && <span className="text-primary/50 text-xs">📞 {r.customer_phone}</span>}
          </div>
          {(r.status === "pending" || r.status === "confirmed") && (
            <div className="mt-3 pt-3 border-t border-muted/10">
              <button
                type="button"
                onClick={() => onCancel(r.id)}
                className="text-xs text-brand-red hover:text-white border border-brand-red hover:bg-brand-red px-3 py-1.5 rounded-sm transition-colors cursor-pointer"
              >
                Anular reserva
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
