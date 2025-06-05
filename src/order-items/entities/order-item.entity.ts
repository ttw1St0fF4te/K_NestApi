import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Order } from "../../orders/entities/order.entity";
import { Product } from "../../products/entities/product.entity";

@Index("PK_OrderItems", ["id"], { unique: true })
@Index("IX_OrderItems_OrderId", ["orderId"], {})
@Index("IX_OrderItems_ProductId", ["productId"], {})
@Entity("OrderItems", { schema: "public" })
export class OrderItem {
  @PrimaryGeneratedColumn({ type: "integer", name: "Id" })
  id: number;

  @Column("integer", { name: "OrderId" })
  orderId: number;

  @Column("integer", { name: "ProductId" })
  productId: number;

  @Column("integer", { name: "Quantity" })
  quantity: number;

  @Column("numeric", { name: "PriceAtOrder", default: () => "0.0" })
  priceAtOrder: string;

  @ManyToOne(() => Order, (order) => order.orderItems, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "OrderId", referencedColumnName: "id" }])
  order: Order;

  @ManyToOne(() => Product, (product) => product.orderItems, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "ProductId", referencedColumnName: "id" }])
  product: Product;
}
