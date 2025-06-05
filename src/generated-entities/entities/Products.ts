import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { CartItems } from "./CartItems";
import { Favorites } from "./Favorites";
import { OrderItems } from "./OrderItems";
import { Reviews } from "./Reviews";

@Index("PK_Products", ["id"], { unique: true })
@Entity("Products", { schema: "public" })
export class Products {
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

  @OneToMany(() => CartItems, (cartItems) => cartItems.product)
  cartItems: CartItems[];

  @OneToMany(() => Favorites, (favorites) => favorites.product)
  favorites: Favorites[];

  @OneToMany(() => OrderItems, (orderItems) => orderItems.product)
  orderItems: OrderItems[];

  @OneToMany(() => Reviews, (reviews) => reviews.product)
  reviews: Reviews[];
}
