export interface Reservation {
  id: number;
  table_id: number;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  party_size: number;
  reservation_date: string;
  reservation_time: string;
  status: string;
  created_at: string;
  table_number: number;
  capacity: number;
}

export interface Stats {
  totalToday: number;
  freeTables: number;
  totalPeople: number;
  totalTables: number;
}

export type Feedback = { type: "success" | "error"; text: string } | null;
