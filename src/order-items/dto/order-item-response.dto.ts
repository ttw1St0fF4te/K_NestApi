export class OrderItemResponseDto {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  priceAtOrder: string;
  product?: {
    id: number;
    name: string;
    price: string;
    category: string;
    description?: string;
    image?: string;
  };
  order?: {
    id: number;
    orderDate: Date;
    customerName?: string;
    totalAmount: string;
  };
  total: number; // calculated field: quantity * priceAtOrder
}
