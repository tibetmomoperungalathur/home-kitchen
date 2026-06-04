export interface AdminOrder {
    id: string;
    order_number: string;
    status:
      | "pending"
      | "preparing"
      | "ready"
      | "picked_up";
  
    subtotal: number;
    notes: string | null;
  
    created_at: string;
  
    customers: {
      name: string;
      phone: string;
      email: string | null;
    };
  
    order_items: {
      id: string;
      product_name: string;
      quantity: number;
    }[];
  }