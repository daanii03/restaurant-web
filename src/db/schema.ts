export interface Admin {
  id: number;
  email: string;
  password_hash: string;
  name: string | null;
  role: "owner" | "admin" | "staff";
  active: number;
  created_at: string;
  last_login_at: string | null;
}

export interface Dish {
  id: number;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  category_id: number;
}

export interface Category {
  id: number;
  name: string;
  order: number;
}

export interface Allergen {
  id: number;
  name: string;
  icon: string | null;
}

export interface DishAllergen {
  dish_id: number;
  allergen_id: number;
  without_option: number;
}

export interface RestaurantTable {
  id: number;
  number: number;
  capacity: number;
  zone: string | null;
  active: number;
}

export type ReservationStatus = "pending" | "confirmed" | "cancelled" | "completed";

export interface Reservation {
  id: number;
  table_id: number;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  party_size: number;
  reservation_date: string;
  reservation_time: string;
  status: ReservationStatus;
  notes: string | null;
  created_at: string;
}
