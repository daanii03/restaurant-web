import type { Stats } from "./types";

interface Props {
  stats: Stats;
}

export function StatsCards({ stats }: Props) {
  const todayOccupied = 15 - stats.freeTables;

  const cards = [
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
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 justify-center items-center px-4 gap-4">
      {cards.map((card) => (
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
  );
}
