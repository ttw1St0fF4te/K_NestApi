import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Orders } from "./Orders";
import { Products } from "./Products";

@Index("PK_OrderItems", ["id"], { unique: true })
@Index("IX_OrderItems_OrderId", ["orderId"], {})
@Index("IX_OrderItems_ProductId", ["productId"], {})
@Entity("OrderItems", { schema: "public" })
export class OrderItems {
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

  @ManyToOne(() => Orders, (orders) => orders.orderItems, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "OrderId", referencedColumnName: "id" }])
  order: Orders;

  @ManyToOne(() => Products, (products) => products.orderItems, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "ProductId", referencedColumnName: "id" }])
  product: Products;
}
