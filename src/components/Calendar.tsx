import { useState } from "react";

interface CalendarProps {
  value: string;
  onChange: (date: string) => void;
}

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function isMonday(date: Date) {
  return date.getDay() === 1;
}

function isPast(date: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return date < today;
}

function isDisabled(date: Date) {
  return isMonday(date) || isPast(date);
}

function toDateStr(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function Calendar({ value, onChange }: CalendarProps) {
  const selected = value ? new Date(value + "T12:00:00") : new Date();
  const [viewYear, setViewYear] = useState(selected.getFullYear());
  const [viewMonth, setViewMonth] = useState(selected.getMonth());

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const firstDay = new Date(viewYear, viewMonth, 1);
  const startOffset = (firstDay.getDay() + 6) % 7; // 0 = Mon, 6 = Sun
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const days: { day: number; month: number; year: number }[] = [];

  const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
  const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
  const daysInPrev = new Date(prevYear, prevMonth + 1, 0).getDate();

  for (let i = startOffset - 1; i >= 0; i--) {
    days.push({ day: daysInPrev - i, month: prevMonth, year: prevYear });
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ day: i, month: viewMonth, year: viewYear });
  }

  const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
  const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push({ day: i, month: nextMonth, year: nextYear });
  }

  const navigate = (month: number, year: number) => {
    setViewMonth(month);
    setViewYear(year);
  };

  const handleDayClick = (day: number, month: number, year: number) => {
    const date = new Date(year, month, day);
    if (isDisabled(date)) return;
    onChange(toDateStr(date));
    if (month !== viewMonth) navigate(month, year);
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      <label className="text-primary font-bold text-sm">Fecha</label>
      <div className="bg-elevated border border-muted/40 rounded-sm p-2 select-none">
        <div className="flex items-center justify-between mb-1">
          <button
            type="button"
            onClick={() => navigate(prevMonth, prevYear)}
            className="text-primary hover:text-accent-light transition-colors cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6" /></svg>
          </button>
          <span className="text-primary font-bold text-xs">
            {MONTHS[viewMonth]} {viewYear}
          </span>
          <button
            type="button"
            onClick={() => navigate(nextMonth, nextYear)}
            className="text-primary hover:text-accent-light transition-colors cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6" /></svg>
          </button>
        </div>

        <div className="grid grid-cols-7">
          {DAYS.map((d) => (
            <div key={d} className="text-center text-[10px] text-primary/60 font-bold py-0.5">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((cell, i) => {
            const date = new Date(cell.year, cell.month, cell.day);
            const disabled = isDisabled(date);
            const isCurrent = cell.month === viewMonth;
            const cellStr = toDateStr(date);
            const selected = cellStr === value;

            return (
              <button
                key={i}
                type="button"
                onClick={() => handleDayClick(cell.day, cell.month, cell.year)}
                disabled={disabled}
                className={`text-center text-xs py-1 rounded-sm transition-colors
                  ${!isCurrent ? "text-primary/30" : ""}
                  ${disabled ? "text-primary/20 cursor-not-allowed" : "cursor-pointer hover:bg-primary/20"}
                  ${selected ? "bg-brand-red text-white hover:bg-brand-red font-bold" : isCurrent && !disabled ? "text-primary" : ""}
                `}
              >
                {cell.day}
              </button>
            );
          })}
        </div>
      </div>
      {value && isMonday(new Date(value + "T12:00:00")) && (
        <p className="text-brand-red text-[10px]">Los lunes estamos cerrados</p>
      )}
      {value && !isMonday(new Date(value + "T12:00:00")) && (() => {
        const date = new Date(value + "T12:00:00");
        date.setHours(0, 0, 0, 0);
        if (date < today) return <p className="text-brand-red text-[10px]">La fecha no puede ser anterior a hoy</p>;
        return null;
      })()}
    </div>
  );
}
