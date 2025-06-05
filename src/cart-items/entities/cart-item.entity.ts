import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Cart } from "../../carts/entities/cart.entity";
import { Product } from "../../products/entities/product.entity";

@Index("IX_CartItems_CartId", ["cartId"], {})
@Index("PK_CartItems", ["id"], { unique: true })
@Index("IX_CartItems_ProductId", ["productId"], {})
@Entity("CartItems", { schema: "public" })
export class CartItem {
  @PrimaryGeneratedColumn({ type: "integer", name: "Id" })
  id: number;

  @Column("integer", { name: "CartId" })
  cartId: number;

  @Column("integer", { name: "ProductId" })
  productId: number;

  @Column("integer", { name: "Quantity" })
  quantity: number;

  @ManyToOne(() => Cart, (cart) => cart.cartItems, { onDelete: "CASCADE" })
  @JoinColumn([{ name: "CartId", referencedColumnName: "id" }])
  cart: Cart;

  @ManyToOne(() => Product, (product) => product.cartItems, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "ProductId", referencedColumnName: "id" }])
  product: Product;
}
