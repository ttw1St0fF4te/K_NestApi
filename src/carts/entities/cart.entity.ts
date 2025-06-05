import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { CartItem } from "../../cart-items/entities/cart-item.entity";
import { User } from "../../users/entities/user.entity";

@Index("PK_Carts", ["id"], { unique: true })
@Index("IX_Carts_UserId", ["userId"], {})
@Entity("Carts", { schema: "public" })
export class Cart {
  @PrimaryGeneratedColumn({ type: "integer", name: "Id" })
  id: number;

  @Column("integer", { name: "UserId" })
  userId: number;

  @OneToMany(() => CartItem, (cartItem) => cartItem.cart)
  cartItems: CartItem[];

  @ManyToOne(() => User, (user) => user.carts, { onDelete: "CASCADE" })
  @JoinColumn([{ name: "UserId", referencedColumnName: "id" }])
  user: User;
}
