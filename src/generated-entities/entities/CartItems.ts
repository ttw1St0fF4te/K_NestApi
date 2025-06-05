import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Carts } from "./Carts";
import { Products } from "./Products";

@Index("IX_CartItems_CartId", ["cartId"], {})
@Index("PK_CartItems", ["id"], { unique: true })
@Index("IX_CartItems_ProductId", ["productId"], {})
@Entity("CartItems", { schema: "public" })
export class CartItems {
  @PrimaryGeneratedColumn({ type: "integer", name: "Id" })
  id: number;

  @Column("integer", { name: "CartId" })
  cartId: number;

  @Column("integer", { name: "ProductId" })
  productId: number;

  @Column("integer", { name: "Quantity" })
  quantity: number;

  @ManyToOne(() => Carts, (carts) => carts.cartItems, { onDelete: "CASCADE" })
  @JoinColumn([{ name: "CartId", referencedColumnName: "id" }])
  cart: Carts;

  @ManyToOne(() => Products, (products) => products.cartItems, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "ProductId", referencedColumnName: "id" }])
  product: Products;
}
