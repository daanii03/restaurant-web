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
}
