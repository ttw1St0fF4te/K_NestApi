import {
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Column,
} from "typeorm";
import { Product } from "../../products/entities/product.entity";
import { User } from "../../users/entities/user.entity";

@Index("favorites_pkey", ["id"], { unique: true })
@Entity("Favorites", { schema: "public" })
export class Favorite {
  @PrimaryGeneratedColumn({ type: "integer", name: "Id" })
  id: number;

  @Column({ name: "ProductId", type: "integer" })
  productId: number;

  @Column({ name: "UserId", type: "integer" })
  userId: number;

  @ManyToOne(() => Product, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "ProductId", referencedColumnName: "id" }])
  product: Product;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn([{ name: "UserId", referencedColumnName: "id" }])
  user: User;
}
