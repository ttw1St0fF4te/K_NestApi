import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { OrderItem } from "../../order-items/entities/order-item.entity";
import { User } from "../../users/entities/user.entity";

@Index("PK_Orders", ["id"], { unique: true })
@Index("IX_Orders_UserId", ["userId"], {})
@Entity("Orders", { schema: "public" })
export class Order {
  @PrimaryGeneratedColumn({ type: "integer", name: "Id" })
  id: number;

  @Column("integer", { name: "UserId" })
  userId: number;

  @Column("timestamp with time zone", { name: "OrderDate" })
  orderDate: Date;

  @Column("text", { name: "CustomerName", nullable: true })
  customerName: string | null;

  @Column("text", { name: "CustomerPhone", nullable: true })
  customerPhone: string | null;

  @Column("text", { name: "DeliveryAddress", nullable: true })
  deliveryAddress: string | null;

  @Column("numeric", { name: "FinalAmount", default: () => "0.0" })
  finalAmount: string;

  @Column("numeric", { name: "TotalAmount", default: () => "0.0" })
  totalAmount: string;

  @Column("numeric", { name: "WalletEarned", nullable: true })
  walletEarned: string | null;

  @Column("numeric", { name: "WalletUsed", nullable: true })
  walletUsed: string | null;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  orderItems: OrderItem[];

  @ManyToOne(() => User, (user) => user.orders, { onDelete: "CASCADE" })
  @JoinColumn([{ name: "UserId", referencedColumnName: "id" }])
  user: User;
}
