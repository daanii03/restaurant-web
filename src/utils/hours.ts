export function getAvailableHours(dateStr: string): string[] {
  if (!dateStr) return [];
  const day = new Date(dateStr + "T12:00:00").getDay();

  if (day === 1) return [];

  const slots: string[] = [];
  const addRange = (start: string, end: string) => {
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
  };

  addRange("07:30", "16:00");

  if (day === 0 || day === 5 || day === 6) {
    addRange("20:00", "23:30");
  }

  return slots;
}
