export type Product = {
  id: string;
  title: string;
  description: string;
  price: number; // retail price in VND
  group_price: number; // discounted group price in VND
  images: string[];
  current_groups?: number;
};

export type Group = {
  id: string;
  product_id: string;
  leader_id: string;
  required_count: number;
  current_count: number;
  expires_at: string; // ISO string
  status: "open" | "completed" | "failed";
  participants: string[]; // user ids
};

export type Order = {
  id: string;
  user_id: string;
  group_id?: string;
  product_id: string;
  amount: number;
  status: "pending" | "paid" | "shipped" | "delivered" | "canceled";
};

