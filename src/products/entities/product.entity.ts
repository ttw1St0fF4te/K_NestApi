import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { CartItem } from "../../cart-items/entities/cart-item.entity";
import { Favorite } from "../../favorites/entities/favorite.entity";
import { OrderItem } from "../../order-items/entities/order-item.entity";
import { Review } from "../../reviews/entities/review.entity";

@Index("PK_Products", ["id"], { unique: true })
@Entity("Products", { schema: "public" })
export class Product {
  @PrimaryGeneratedColumn({ type: "integer", name: "Id" })
  id: number;

  @Column("text", { name: "Category" })
  category: string;

  @Column("text", { name: "Name" })
  name: string;

  @Column("text", { name: "Image" })
  image: string;

  @Column("numeric", { name: "Price" })
  price: string;

  @Column("text", { name: "Description" })
  description: string;

  @OneToMany(() => CartItem, (cartItem) => cartItem.product)
  cartItems: CartItem[];

  @OneToMany(() => Favorite, (favorite) => favorite.product)
  favorites: Favorite[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems: OrderItem[];

  @OneToMany(() => Review, (review) => review.product)
  reviews: Review[];
}
