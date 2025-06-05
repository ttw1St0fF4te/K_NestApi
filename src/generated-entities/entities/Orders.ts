import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { OrderItems } from "./OrderItems";
import { Users } from "./Users";

@Index("PK_Orders", ["id"], { unique: true })
@Index("IX_Orders_UserId", ["userId"], {})
@Entity("Orders", { schema: "public" })
export class Orders {
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

  @OneToMany(() => OrderItems, (orderItems) => orderItems.order)
  orderItems: OrderItems[];

  @ManyToOne(() => Users, (users) => users.orders, { onDelete: "CASCADE" })
  @JoinColumn([{ name: "UserId", referencedColumnName: "id" }])
  user: Users;
}
