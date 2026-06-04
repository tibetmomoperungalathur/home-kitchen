export interface MenuItem {
    id: string;
    price: number;
    products: {
      id: string;
      name: string;
      description: string;
    };
  }