
export interface Category {
    id: number;
    name:string;
    order:number;
}

export interface Allergen {
    id: number;
    name: string;
    icon: string;   
}

export interface Dish {
    id: number;
    slug: string;
    name: string;
    description:string;
    price: number;
    category_id: number;
    image?:string;
}