import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { CartItems } from "./CartItems";
import { Users } from "./Users";

@Index("PK_Carts", ["id"], { unique: true })
@Index("IX_Carts_UserId", ["userId"], {})
@Entity("Carts", { schema: "public" })
export class Carts {
  @PrimaryGeneratedColumn({ type: "integer", name: "Id" })
  id: number;

  @Column("integer", { name: "UserId" })
  userId: number;

  @OneToMany(() => CartItems, (cartItems) => cartItems.cart)
  cartItems: CartItems[];

  @ManyToOne(() => Users, (users) => users.carts, { onDelete: "CASCADE" })
  @JoinColumn([{ name: "UserId", referencedColumnName: "id" }])
  user: Users;
}
