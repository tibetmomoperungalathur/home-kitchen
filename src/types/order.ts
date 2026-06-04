export interface OrderItemInput {
    menuId: string;
    quantity: number;
  }
  
  export interface CreateOrderRequest {
    name: string;
    phone: string;
    email?: string;
    notes?: string;
  
    items: OrderItemInput[];
  }