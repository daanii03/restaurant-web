import { useState, useEffect, useCallback } from "react";
import type { Reservation, Stats, Feedback } from "@components/admin/types";
import { StatsCards } from "@components/admin/StatsCards";
import { ReservationTable } from "@components/admin/ReservationTable";
import { ReservationMobileCards } from "@components/admin/ReservationMobileCards";
import { NewReservationModal } from "@components/admin/NewReservationModal";
import { EditReservationModal } from "@components/admin/EditReservationModal";

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function calculateStats(reservations: Reservation[], totalTables: number): Stats {
  const today = todayStr();
  const todayActive = reservations.filter(
    (r) => r.reservation_date === today && r.status !== "cancelled"
  );
  const totalToday = todayActive.length;
  const totalPeople = todayActive.reduce((sum, r) => sum + r.party_size, 0);
  const reservedTableIds = todayActive
    .filter((r) => r.status === "pending" || r.status === "confirmed")
    .map((r) => r.table_id);
  const freeTables = totalTables - new Set(reservedTableIds).size;
  return { totalToday, freeTables, totalPeople };
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`bg-muted/20 rounded-sm animate-pulse ${className ?? ""}`} />;
}

export function AdminReservationPanel() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalToday: 0,
    freeTables: 0,
    totalPeople: 0,
  });
  const [totalTables, setTotalTables] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/reservations?t=${Date.now()}`);
      if (!res.ok) return;
      const data = await res.json();
      const today = todayStr();
      const filtered = (data.reservations as Reservation[]).filter(
        (r) => r.reservation_date >= today
      );
      setReservations(filtered);
      setStats(data.stats);
      setTotalTables(data.stats.totalTables);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching reservations:", err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") fetchData();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [fetchData]);

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

  const handleCancel = async (id: number) => {
    const updated = reservations.map((r) =>
      r.id === id ? { ...r, status: "cancelled" } : r
    );
    setReservations(updated);
    setStats(calculateStats(updated, totalTables));
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

  const handleCreated = (reservation: Reservation) => {
    const updated = [reservation, ...reservations];
    setReservations(updated);
    setStats(calculateStats(updated, totalTables));
    fetchData();
  };

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
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 px-4 gap-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        ) : (
          <StatsCards stats={stats} />
        )}

        <div className="px-4 mt-8">
          <h2 className="text-primary font-serif text-2xl mb-4">Próximas Reservas</h2>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : reservations.length === 0 ? (
            <p className="text-primary/60 italic">No hay próximas reservas.</p>
          ) : (
            <>
              <ReservationTable reservations={reservations} onCancel={handleCancel} onEdit={(r) => { setEditingReservation(r); setEditModalOpen(true); }} />
              <ReservationMobileCards reservations={reservations} onCancel={handleCancel} onEdit={(r) => { setEditingReservation(r); setEditModalOpen(true); }} />
            </>
          )}
        </div>
      </section>

      <NewReservationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={handleCreated}
        onFeedback={(text, type) => setFeedback({ type, text })}
      />
      <EditReservationModal
        reservation={editingReservation}
        open={editModalOpen}
        onClose={() => { setEditModalOpen(false); setEditingReservation(null); }}
        onUpdated={fetchData}
        onFeedback={(text, type) => setFeedback({ type, text })}
      />
    </>
  );
}
