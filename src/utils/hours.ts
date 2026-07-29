const DEFAULT_HOURS: Record<string, { closed?: boolean; slots?: string[][] }> = {
  "0": { slots: [["07:30", "16:00"], ["20:00", "23:30"]] },
  "1": { closed: true },
  "2": { slots: [["07:30", "16:00"]] },
  "3": { slots: [["07:30", "16:00"]] },
  "4": { slots: [["07:30", "16:00"]] },
  "5": { slots: [["07:30", "16:00"], ["20:00", "23:30"]] },
  "6": { slots: [["07:30", "16:00"], ["20:00", "23:30"]] },
};

function getConfig() {
  if (typeof window !== "undefined" && (window as any).__HOURS_CONFIG) {
    return (window as any).__HOURS_CONFIG as typeof DEFAULT_HOURS;
  }
  return DEFAULT_HOURS;
}

function addRange(start: string, end: string, slots: string[]) {
  let [h, m] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  while (h < eh || (h === eh && m <= em)) {
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    m += 30;
    if (m >= 60) {
      h++;
      m = 0;
    }
  }
}

export function getAvailableHours(dateStr: string): string[] {
  if (!dateStr) return [];
  const day = new Date(dateStr + "T12:00:00").getDay();
  const config = getConfig();
  const dayConfig = config[String(day)];

  if (dayConfig?.closed) return [];

  const slots: string[] = [];
  if (dayConfig?.slots) {
    for (const [start, end] of dayConfig.slots) {
      const [eh, em] = end.split(":").map(Number);
      const totalMin = eh * 60 + em - 60;
      if (totalMin <= 0) continue;
      const lastH = Math.floor(totalMin / 60);
      const lastM = totalMin % 60;
      addRange(start, `${String(lastH).padStart(2, "0")}:${String(lastM).padStart(2, "0")}`, slots);
    }
  }
  return slots;
}
